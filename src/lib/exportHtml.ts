import { collectTargets } from './editorTargets';

/**
 * Produce a clean HTML string for download.
 *
 * Strategy:
 * 1. Parse the ORIGINAL (pre-sanitize) HTML into a fresh document so that
 *    script tags, onclick handlers, etc. are preserved in the output.
 * 2. For each element the user actually edited (marked data-jeeves-changed),
 *    locate the corresponding element in the original document by index and
 *    overwrite its innerHTML.
 *    Elements are processed in REVERSE index order (children before parents)
 *    so that a parent copy never overwrites a child copy done just before it.
 * 3. Strip any editor-only artifacts that may have been introduced via
 *    innerHTML copying (data-jeeves-*, contenteditable, jeeves-* classes, and
 *    the injected style blocks).
 *
 * The editedDoc is never mutated.
 */
export function exportHtml(editedDoc: Document, originalHtml: string): string {
  const originalDoc = new DOMParser().parseFromString(originalHtml, 'text/html');
  const originalTargets = collectTargets(originalDoc);

  // Collect changed elements and process them deepest-first (reverse idx)
  const changed = [
    ...editedDoc.querySelectorAll<HTMLElement>('[data-jeeves-changed]'),
  ].sort((a, b) => {
    const ai = parseInt(a.getAttribute('data-jeeves-idx') ?? '0', 10);
    const bi = parseInt(b.getAttribute('data-jeeves-idx') ?? '0', 10);
    return bi - ai; // descending → children before parents
  });

  for (const editedEl of changed) {
    const idx = parseInt(editedEl.getAttribute('data-jeeves-idx') ?? '', 10);
    if (isNaN(idx)) continue;
    const originalEl = originalTargets[idx];
    if (!originalEl) continue;
    originalEl.innerHTML = editedEl.innerHTML;
  }

  // Remove injected style blocks first, before the data-jeeves-* attr strip
  originalDoc
    .querySelectorAll('style[data-jeeves-editor], style[data-jeeves-reveal]')
    .forEach((el) => el.remove());

  // Strip all editor-only attributes that may have arrived via innerHTML copies
  originalDoc.querySelectorAll('*').forEach((el) => {
    if (el.hasAttribute('contenteditable')) el.removeAttribute('contenteditable');

    el.classList.remove('jeeves-hover', 'jeeves-editing');
    if (el.classList.length === 0 && el.hasAttribute('class')) {
      el.removeAttribute('class');
    }

    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-jeeves-')) el.removeAttribute(name);
    }
  });

  const doctypeName =
    originalDoc.doctype && originalDoc.doctype.name !== 'html'
      ? originalDoc.doctype.name
      : 'html';

  return `<!DOCTYPE ${doctypeName}>\n` + originalDoc.documentElement.outerHTML;
}
