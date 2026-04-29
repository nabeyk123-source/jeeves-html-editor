/**
 * Sanitize an HTML string by removing dangerous elements and event-handler
 * attributes, while preserving styles and overall structure.
 */
export function sanitizeHtml(htmlString: string): string {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');

  // Remove dangerous elements entirely.
  const dangerousSelectors = 'script, iframe, object, embed';
  doc.querySelectorAll(dangerousSelectors).forEach((el) => el.remove());

  // Strip any on* event-handler attributes from every element.
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    // Copy attribute names first because removeAttribute mutates the live NamedNodeMap.
    for (const name of el.getAttributeNames()) {
      if (name.toLowerCase().startsWith('on')) {
        el.removeAttribute(name);
      }
    }
  });

  const doctype =
    doc.doctype && doc.doctype.name && doc.doctype.name.toLowerCase() !== 'html'
      ? `<!DOCTYPE ${doc.doctype.name}>\n`
      : '<!DOCTYPE html>\n';

  return doctype + doc.documentElement.outerHTML;
}
