const FIXED_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,a,button,li,td,th,dt,dd';

// Decorative void elements that don't disqualify an element from text-leaf status
const INLINE_VOID_TAGS = new Set(['BR', 'WBR']);

// Tags that should never be auto-promoted as editable targets
const EXCLUDED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE',
  'META', 'LINK', 'TITLE', 'HEAD', 'BASE', 'SVG', 'MATH',
  // Layout/structural containers — too noisy when clicked
  'BODY', 'HTML', 'MAIN', 'ARTICLE', 'SECTION',
  'HEADER', 'FOOTER', 'NAV', 'ASIDE', 'FORM', 'FIELDSET',
]);

const EDITOR_CSS = `
  [data-jeeves-target] {
    transition: background-color 120ms ease, outline 120ms ease;
    cursor: text;
  }
  [data-jeeves-target]:hover {
    background-color: rgba(200, 169, 106, 0.18);
  }
  [data-jeeves-target]:has([data-jeeves-target]:hover) {
    background-color: transparent;
  }
  [data-jeeves-target].jeeves-editing {
    background-color: rgba(200, 169, 106, 0.08);
    outline: 2px solid #c8a96a;
    outline-offset: 2px;
  }
`;

/**
 * Text-only leaf: all child elements (if any) are decorative void tags (br, wbr),
 * and the element has non-empty text content.
 * e.g. <div>Hello</div>  or  <div>Line 1<br>Line 2</div>
 */
function isTextLeaf(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return false;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!INLINE_VOID_TAGS.has((node as HTMLElement).tagName)) return false;
    }
  }
  return (el.textContent?.trim().length ?? 0) > 0;
}

/**
 * Mixed content: has at least one non-whitespace direct text node child
 * AND at least one non-inline element child.
 * Making this editable lets users edit the bare text alongside nested elements.
 * e.g. <div>¥2,000 <span class="unit">/人</span></div>
 */
function hasMixedContent(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return false;
  let hasElementChild = false;
  let hasDirectText = false;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!INLINE_VOID_TAGS.has((node as HTMLElement).tagName)) hasElementChild = true;
    } else if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent?.trim().length ?? 0) > 0) hasDirectText = true;
    }
  }
  return hasElementChild && hasDirectText;
}

export function injectEditor(doc: Document): void {
  const style = doc.createElement('style');
  style.setAttribute('data-jeeves-editor', '');
  style.textContent = EDITOR_CSS;
  doc.head.appendChild(style);

  // Fixed editable tags (per spec)
  const fixedTargets = doc.querySelectorAll<HTMLElement>(FIXED_SELECTOR);

  // Auto-detected targets: text-only leaves + mixed-content elements
  const autoTargets: HTMLElement[] = [];
  if (doc.body) {
    doc.body.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (isTextLeaf(el) || hasMixedContent(el)) autoTargets.push(el);
    });
  }

  // Combine, deduplicating via Set
  const targets = new Set<HTMLElement>([...fixedTargets, ...autoTargets]);

  targets.forEach((el) => {
    el.setAttribute('data-jeeves-target', '');
    el.addEventListener('click', handleClick);
    el.addEventListener('keydown', handleKeyDown);
    el.addEventListener('blur', handleBlur);
  });
}

function handleClick(this: HTMLElement, e: MouseEvent): void {
  const target = this;
  if (target.isContentEditable) return;

  e.preventDefault();
  e.stopPropagation();

  target.setAttribute('contenteditable', 'true');
  target.classList.add('jeeves-editing');
  target.dataset.jeevesOriginal = target.innerHTML;
  target.focus();

  const doc = target.ownerDocument;
  const sel = doc.getSelection();
  if (sel) {
    const range = doc.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function handleKeyDown(this: HTMLElement, e: KeyboardEvent): void {
  const target = this;
  if (target.getAttribute('contenteditable') !== 'true') return;

  if (e.key === 'Enter') {
    e.preventDefault();
    if (e.shiftKey) {
      // Shift+Enter: insert <br> at cursor and continue editing
      const doc = target.ownerDocument;
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const br = doc.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      target.blur();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    const original = target.dataset.jeevesOriginal;
    if (original !== undefined) {
      target.innerHTML = original;
    }
    target.blur();
  }
}

function handleBlur(this: HTMLElement): void {
  const target = this;
  if (target.getAttribute('contenteditable') !== 'true') return;
  target.removeAttribute('contenteditable');
  target.classList.remove('jeeves-editing');
  delete target.dataset.jeevesOriginal;
}
