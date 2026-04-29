import { describe, it, expect } from 'vitest';
import { exportHtml } from '../exportHtml';

// ─── helpers ────────────────────────────────────────────────────────────────

const reparse = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html');

/**
 * Build a minimal editedDoc that simulates what injectEditor produces.
 * Each element gets data-jeeves-idx and, if edited, data-jeeves-changed.
 */
function makeEditedDoc(bodyHtml = ''): Document {
  return new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head></head><body>${bodyHtml}</body></html>`,
    'text/html',
  );
}

function makeOriginalHtml(bodyHtml = ''): string {
  return `<!DOCTYPE html><html><head></head><body>${bodyHtml}</body></html>`;
}

// ─── core sync behaviour ─────────────────────────────────────────────────────

describe('innerHTML sync', () => {
  it('applies edited text to the matching element in the original HTML', () => {
    const editedDoc = makeEditedDoc(
      '<p data-jeeves-idx="0" data-jeeves-changed="">edited text</p>',
    );
    const originalHtml = makeOriginalHtml('<p>original text</p>');

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('p')?.textContent).toBe('edited text');
  });

  it('leaves unedited elements untouched in the output', () => {
    // idx 0 is changed, idx 1 is not
    const editedDoc = makeEditedDoc(
      '<h1 data-jeeves-idx="0" data-jeeves-changed="">New Title</h1>' +
        '<p data-jeeves-idx="1">unchanged</p>',
    );
    const originalHtml = makeOriginalHtml(
      '<h1>Old Title</h1><p>unchanged</p>',
    );

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('h1')?.textContent).toBe('New Title');
    expect(out.querySelector('p')?.textContent).toBe('unchanged');
  });

  it('handles multiple edits correctly', () => {
    const editedDoc = makeEditedDoc(
      '<h1 data-jeeves-idx="0" data-jeeves-changed="">Title</h1>' +
        '<p data-jeeves-idx="1" data-jeeves-changed="">Body</p>',
    );
    const originalHtml = makeOriginalHtml('<h1>Old</h1><p>Old body</p>');

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('h1')?.textContent).toBe('Title');
    expect(out.querySelector('p')?.textContent).toBe('Body');
  });

  it('processes children before parents so parent copy includes child edit', () => {
    // collectTargets: span is idx 0 (FIXED_SELECTOR), div is idx 1 (hasMixedContent auto)
    // Both edited; parent div's innerHTML in the live editedDoc already contains the new span text.
    const editedDoc = makeEditedDoc(
      '<div data-jeeves-idx="1" data-jeeves-changed="">' +
        'price: <span data-jeeves-idx="0" data-jeeves-changed="">¥2,000</span>' +
        '</div>',
    );
    const originalHtml = makeOriginalHtml(
      '<div>price: <span>¥1,000</span></div>',
    );

    const out = reparse(exportHtml(editedDoc, originalHtml));
    // Span edit arrives in parent's innerHTML; output should reflect ¥2,000
    expect(out.querySelector('span')?.textContent).toBe('¥2,000');
    expect(out.querySelector('div')?.textContent).toContain('¥2,000');
  });

  it('does not sync elements without data-jeeves-changed', () => {
    const editedDoc = makeEditedDoc(
      '<p data-jeeves-idx="0">edited but not marked changed</p>',
    );
    const originalHtml = makeOriginalHtml('<p>original</p>');

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('p')?.textContent).toBe('original');
  });
});

// ─── original HTML preservation ──────────────────────────────────────────────

describe('original HTML preservation', () => {
  it('preserves <script> tags from the original HTML', () => {
    const editedDoc = makeEditedDoc(
      '<h1 data-jeeves-idx="0" data-jeeves-changed="">New</h1>',
    );
    const originalHtml = makeOriginalHtml(
      '<script>var x = 1;</script><h1>Old</h1>',
    );

    const out = exportHtml(editedDoc, originalHtml);
    expect(out).toContain('var x = 1;');
  });

  it('preserves onclick and other event attributes from the original HTML', () => {
    const editedDoc = makeEditedDoc(
      '<button data-jeeves-idx="0" data-jeeves-changed="">Buy</button>',
    );
    const originalHtml = makeOriginalHtml(
      '<button onclick="order()">Order</button>',
    );

    const out = exportHtml(editedDoc, originalHtml);
    expect(out).toContain('onclick="order()"');
    expect(out).toContain('Buy');
  });

  it('does not mutate the editedDoc', () => {
    const editedDoc = makeEditedDoc(
      '<p data-jeeves-idx="0" data-jeeves-changed="" contenteditable="true">text</p>',
    );
    const originalHtml = makeOriginalHtml('<p>old</p>');

    exportHtml(editedDoc, originalHtml);

    // editedDoc should still have its original attributes intact
    expect(
      editedDoc.querySelector('[data-jeeves-changed]'),
    ).not.toBeNull();
  });
});

// ─── editor-artifact cleanup ─────────────────────────────────────────────────

describe('editor artifact cleanup', () => {
  it('strips data-jeeves-* attributes that arrive via innerHTML copy', () => {
    // Edited parent copies innerHTML containing a child with jeeves attrs
    const editedDoc = makeEditedDoc(
      '<div data-jeeves-idx="0" data-jeeves-changed="">' +
        '<span data-jeeves-idx="1" data-jeeves-target="">text</span>' +
        '</div>',
    );
    const originalHtml = makeOriginalHtml('<div><span>old</span></div>');

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('[data-jeeves-idx]')).toBeNull();
    expect(out.querySelector('[data-jeeves-target]')).toBeNull();
  });

  it('strips contenteditable that arrives via innerHTML copy', () => {
    const editedDoc = makeEditedDoc(
      '<div data-jeeves-idx="0" data-jeeves-changed="">' +
        '<span contenteditable="true">editing</span>' +
        '</div>',
    );
    const originalHtml = makeOriginalHtml('<div><span>old</span></div>');

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('[contenteditable]')).toBeNull();
  });

  it('removes <style data-jeeves-editor> but preserves user-defined <style>', () => {
    const editedDoc = makeEditedDoc('');
    // Simulate original having a user style AND we inject an editor style into edited
    // (in practice the editor style is only in editedDoc/iframe, not original)
    const originalHtml = `<!DOCTYPE html><html><head>
      <style>body { color: red; }</style>
      <style data-jeeves-editor="">.jeeves-hover{}</style>
    </head><body></body></html>`;

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('style[data-jeeves-editor]')).toBeNull();
    const styles = out.querySelectorAll('style');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('color: red');
  });

  it('removes <style data-jeeves-reveal>', () => {
    const editedDoc = makeEditedDoc('');
    const originalHtml = `<!DOCTYPE html><html><head>
      <style>body { margin: 0; }</style>
      <style data-jeeves-reveal="">[data-jeeves-hidden]{display:revert!important}</style>
    </head><body></body></html>`;

    const out = reparse(exportHtml(editedDoc, originalHtml));
    expect(out.querySelector('style[data-jeeves-reveal]')).toBeNull();
    expect(out.querySelectorAll('style').length).toBe(1);
  });
});

// ─── output format ───────────────────────────────────────────────────────────

describe('output format', () => {
  it('starts with <!DOCTYPE html>', () => {
    const out = exportHtml(makeEditedDoc(''), makeOriginalHtml(''));
    expect(out.startsWith('<!DOCTYPE html>')).toBe(true);
  });
});
