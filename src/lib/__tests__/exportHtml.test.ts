import { describe, it, expect } from 'vitest';
import { exportHtml } from '../exportHtml';

function makeDoc(): Document {
  return document.implementation.createHTMLDocument('test');
}

function reparse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('exportHtml', () => {
  it('removes contenteditable="true" from elements', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.setAttribute('contenteditable', 'true');
    p.textContent = 'hello';
    doc.body.appendChild(p);

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.hasAttribute('contenteditable')).toBe(false);
  });

  it('removes .jeeves-editing class but preserves unrelated classes', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.className = 'important jeeves-editing';
    doc.body.appendChild(p);

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.classList.contains('jeeves-editing')).toBe(false);
    expect(exported.classList.contains('important')).toBe(true);
  });

  it('removes .jeeves-hover class', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.className = 'foo jeeves-hover';
    doc.body.appendChild(p);

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.classList.contains('jeeves-hover')).toBe(false);
    expect(exported.classList.contains('foo')).toBe(true);
  });

  it('removes the entire class attribute when only jeeves classes were present', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.className = 'jeeves-editing';
    doc.body.appendChild(p);
    const span = doc.createElement('span');
    span.className = 'jeeves-hover';
    doc.body.appendChild(span);

    const out = reparse(exportHtml(doc));
    const exportedP = out.querySelector('p')!;
    const exportedSpan = out.querySelector('span')!;
    expect(exportedP.hasAttribute('class')).toBe(false);
    expect(exportedSpan.hasAttribute('class')).toBe(false);
  });

  it('removes <style data-jeeves-editor> but preserves user-defined <style>', () => {
    const doc = makeDoc();
    const userStyle = doc.createElement('style');
    userStyle.textContent = 'body { color: red; }';
    doc.head.appendChild(userStyle);

    const editorStyle = doc.createElement('style');
    editorStyle.setAttribute('data-jeeves-editor', '');
    editorStyle.textContent = '.jeeves-hover { outline: 1px solid blue; }';
    doc.head.appendChild(editorStyle);

    const out = reparse(exportHtml(doc));
    const styles = out.querySelectorAll('style');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toBe('body { color: red; }');
    expect(out.querySelector('style[data-jeeves-editor]')).toBeNull();
  });

  it('removes the data-jeeves-original attribute', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.setAttribute('data-jeeves-original', '<b>before</b>');
    p.textContent = 'after';
    doc.body.appendChild(p);

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.hasAttribute('data-jeeves-original')).toBe(false);
  });

  it('removes any other data-jeeves-* attributes', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.setAttribute('data-jeeves-foo', '1');
    p.setAttribute('data-jeeves-bar', '2');
    p.setAttribute('data-keep-me', 'ok');
    doc.body.appendChild(p);

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.hasAttribute('data-jeeves-foo')).toBe(false);
    expect(exported.hasAttribute('data-jeeves-bar')).toBe(false);
    expect(exported.getAttribute('data-keep-me')).toBe('ok');
  });

  it('reflects edited innerHTML in the output', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.textContent = 'old text';
    doc.body.appendChild(p);

    // Simulate the user editing the paragraph in place.
    p.innerHTML = 'shiny new text';

    const out = reparse(exportHtml(doc));
    const exported = out.querySelector('p')!;
    expect(exported.textContent).toBe('shiny new text');
  });

  it('does not mutate the original document', () => {
    const doc = makeDoc();
    const p = doc.createElement('p');
    p.setAttribute('contenteditable', 'true');
    p.className = 'jeeves-editing';
    p.setAttribute('data-jeeves-original', 'x');
    doc.body.appendChild(p);

    exportHtml(doc);

    // The source doc should still carry every editor marking.
    expect(doc.querySelector('[contenteditable]')).not.toBeNull();
    expect(doc.querySelector('.jeeves-editing')).not.toBeNull();
    expect(doc.querySelector('[data-jeeves-original]')).not.toBeNull();
  });

  it('removes <style data-jeeves-reveal> but preserves user-defined <style>', () => {
    const doc = makeDoc();
    const userStyle = doc.createElement('style');
    userStyle.textContent = 'body { margin: 0; }';
    doc.head.appendChild(userStyle);

    const revealStyle = doc.createElement('style');
    revealStyle.setAttribute('data-jeeves-reveal', '');
    revealStyle.textContent = '[data-jeeves-hidden] { display: revert !important; }';
    doc.head.appendChild(revealStyle);

    const out = reparse(exportHtml(doc));
    expect(out.querySelector('style[data-jeeves-reveal]')).toBeNull();
    expect(out.querySelectorAll('style').length).toBe(1);
    expect(out.querySelectorAll('style')[0].textContent).toBe('body { margin: 0; }');
  });

  it('produces output that starts with <!DOCTYPE html>', () => {
    const doc = makeDoc();
    const out = exportHtml(doc);
    expect(out.startsWith('<!DOCTYPE html>')).toBe(true);
  });
});
