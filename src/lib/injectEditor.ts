import { collectTargets } from './editorTargets';

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

export function injectEditor(doc: Document): void {
  const style = doc.createElement('style');
  style.setAttribute('data-jeeves-editor', '');
  style.textContent = EDITOR_CSS;
  doc.head.appendChild(style);

  collectTargets(doc).forEach((el, idx) => {
    el.setAttribute('data-jeeves-target', '');
    el.setAttribute('data-jeeves-idx', String(idx));
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

  // Mark as changed only if content actually differs from when edit started
  const original = target.dataset.jeevesOriginal;
  if (original !== undefined && target.innerHTML !== original) {
    target.setAttribute('data-jeeves-changed', '');
  }

  target.removeAttribute('contenteditable');
  target.classList.remove('jeeves-editing');
  delete target.dataset.jeevesOriginal;
}
