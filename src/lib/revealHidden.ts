// Tags that are display:none by UA stylesheet — ignore when scanning
const NATURALLY_HIDDEN_TAGS = new Set([
  'SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'TITLE',
  'NOSCRIPT', 'TEMPLATE', 'BASE',
]);

const REVEAL_CSS = `
  [data-jeeves-hidden] {
    display: revert !important;
    visibility: visible !important;
    outline: 1px dashed rgba(200, 169, 106, 0.55);
    outline-offset: 3px;
  }
`;

/**
 * Marks topmost hidden elements (display:none / visibility:hidden) in the body
 * with the `data-jeeves-hidden` attribute, skipping elements whose parent is
 * already hidden (revealing the parent also reveals its children).
 *
 * Returns the count of newly marked elements.
 */
export function markHiddenElements(doc: Document): number {
  const win = doc.defaultView;
  if (!win || !doc.body) return 0;

  let count = 0;
  const elements = doc.body.querySelectorAll<HTMLElement>('*');

  for (const el of elements) {
    if (NATURALLY_HIDDEN_TAGS.has(el.tagName)) continue;

    const cs = win.getComputedStyle(el);
    const selfHidden = cs.display === 'none' || cs.visibility === 'hidden';
    if (!selfHidden) continue;

    // Only mark topmost hidden ancestors — skip if an ancestor is also hidden
    // (revealing the ancestor brings this element back automatically)
    const parent = el.parentElement;
    if (parent && parent !== doc.body) {
      const parentCs = win.getComputedStyle(parent);
      if (parentCs.display === 'none' || parentCs.visibility === 'hidden') continue;
    }

    el.setAttribute('data-jeeves-hidden', '');
    count++;
  }

  return count;
}

/** Injects the reveal CSS block. Idempotent — safe to call multiple times. */
export function injectRevealStyle(doc: Document): void {
  if (doc.querySelector('style[data-jeeves-reveal]')) return;
  const style = doc.createElement('style');
  style.setAttribute('data-jeeves-reveal', '');
  style.textContent = REVEAL_CSS;
  doc.head.appendChild(style);
}

/** Removes the injected reveal CSS block. */
export function removeRevealStyle(doc: Document): void {
  doc.querySelectorAll('style[data-jeeves-reveal]').forEach((el) => el.remove());
}
