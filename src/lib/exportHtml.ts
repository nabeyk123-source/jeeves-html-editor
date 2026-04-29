/**
 * Produce a clean HTML string for download by stripping all editor-only
 * markings (contenteditable, jeeves-* classes, data-jeeves-* attributes,
 * and the injected <style data-jeeves-editor> block) from a clone of `doc`.
 *
 * The input `doc` is never mutated.
 */
export function exportHtml(doc: Document): string {
  const clone = doc.cloneNode(true) as Document;

  // Remove the injected highlight-CSS style block(s) first — must happen
  // before the data-jeeves-* attribute strip below, otherwise the
  // [data-jeeves-editor] selector won't match anymore.
  clone.querySelectorAll('style[data-jeeves-editor]').forEach((el) => el.remove());

  clone.querySelectorAll('*').forEach((el) => {
    if (el.hasAttribute('contenteditable')) {
      el.removeAttribute('contenteditable');
    }

    el.classList.remove('jeeves-hover', 'jeeves-editing');
    if (el.classList.length === 0 && el.hasAttribute('class')) {
      el.removeAttribute('class');
    }

    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-jeeves-')) {
        el.removeAttribute(name);
      }
    }
  });

  const doctypeName =
    clone.doctype && clone.doctype.name && clone.doctype.name !== 'html'
      ? clone.doctype.name
      : 'html';

  return `<!DOCTYPE ${doctypeName}>\n` + clone.documentElement.outerHTML;
}
