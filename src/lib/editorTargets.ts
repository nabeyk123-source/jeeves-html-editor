export const FIXED_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,a,button,li,td,th,dt,dd';

// Decorative void elements that don't disqualify text-leaf classification
export const INLINE_VOID_TAGS = new Set(['BR', 'WBR']);

// Elements removed by sanitizeHtml — treated as invisible so that original and
// sanitized DOMs classify targets identically (same idx ordering)
export const INVISIBLE_TAGS = new Set([
  'SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE',
]);

// Containers that should never become editable targets
export const EXCLUDED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE',
  'META', 'LINK', 'TITLE', 'HEAD', 'BASE', 'SVG', 'MATH',
  'BODY', 'HTML', 'MAIN', 'ARTICLE', 'SECTION',
  'HEADER', 'FOOTER', 'NAV', 'ASIDE', 'FORM', 'FIELDSET',
]);

/**
 * No child elements except decorative voids (br, wbr) and invisible removed
 * elements (script, iframe, …), AND has at least one direct non-empty text node.
 */
export function isTextLeaf(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return false;
  let hasDirectText = false;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName;
      if (INVISIBLE_TAGS.has(tag)) continue;
      if (!INLINE_VOID_TAGS.has(tag)) return false;
    } else if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent?.trim().length ?? 0) > 0) hasDirectText = true;
    }
  }
  return hasDirectText;
}

/**
 * Has at least one non-whitespace direct text node AND at least one
 * non-inline, non-invisible element child.
 * e.g. <div>¥2,000 <span>/人</span></div>
 */
export function hasMixedContent(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return false;
  let hasElementChild = false;
  let hasDirectText = false;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName;
      if (INVISIBLE_TAGS.has(tag)) continue;
      if (!INLINE_VOID_TAGS.has(tag)) hasElementChild = true;
    } else if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent?.trim().length ?? 0) > 0) hasDirectText = true;
    }
  }
  return hasElementChild && hasDirectText;
}

/**
 * Collect all editable targets in document order (DFS).
 * Result is deduplicated and stable — same HTML always produces the same order,
 * whether parsed from the original or the sanitized version.
 */
export function collectTargets(doc: Document): HTMLElement[] {
  const fixed = doc.querySelectorAll<HTMLElement>(FIXED_SELECTOR);
  const auto: HTMLElement[] = [];
  if (doc.body) {
    doc.body.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (isTextLeaf(el) || hasMixedContent(el)) auto.push(el);
    });
  }
  return [...new Set<HTMLElement>([...fixed, ...auto])];
}
