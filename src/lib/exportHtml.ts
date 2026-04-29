/**
 * Produce a clean HTML string for download by stripping all editor-only
 * markings (contenteditable, jeeves-* classes, data-jeeves-* attributes,
 * and the injected <style data-jeeves-editor> / <style data-jeeves-reveal>
 * blocks) from a clone of `doc`.
 *
 * The input `doc` is never mutated.
 */
export function exportHtml(doc: Document): string {
  const clone = doc.cloneNode(true) as Document;

  // Remove injected style blocks first — must happen before the data-jeeves-*
  // attribute strip below, otherwise the attribute-based selectors won't match.
  clone
    .querySelectorAll('style[data-jeeves-editor], style[data-jeeves-reveal]')
    .forEach((el) => el.remove());

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
