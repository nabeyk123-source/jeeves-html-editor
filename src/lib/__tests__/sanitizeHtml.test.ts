import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../sanitizeHtml';

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('sanitizeHtml', () => {
  describe('removes dangerous elements', () => {
    it('removes <script> tags', () => {
      const input = '<html><body><p>safe</p><script>alert(1)</script></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      expect(doc.querySelectorAll('script').length).toBe(0);
      expect(doc.querySelector('p')?.textContent).toBe('safe');
    });

    it('removes <iframe>', () => {
      const input = '<html><body><iframe src="https://evil.example"></iframe><p>ok</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      expect(doc.querySelectorAll('iframe').length).toBe(0);
      expect(doc.querySelector('p')?.textContent).toBe('ok');
    });

    it('removes <object>', () => {
      const input = '<html><body><object data="x.swf"></object><p>ok</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      expect(doc.querySelectorAll('object').length).toBe(0);
      expect(doc.querySelector('p')?.textContent).toBe('ok');
    });

    it('removes <embed>', () => {
      const input = '<html><body><embed src="x.swf"><p>ok</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      expect(doc.querySelectorAll('embed').length).toBe(0);
      expect(doc.querySelector('p')?.textContent).toBe('ok');
    });
  });

  describe('removes on* event-handler attributes', () => {
    it('removes onclick from a button', () => {
      const input = '<html><body><button onclick="hack()">Click</button></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      const btn = doc.querySelector('button');
      expect(btn).not.toBeNull();
      expect(btn!.hasAttribute('onclick')).toBe(false);
      expect(btn!.textContent).toBe('Click');
    });

    it('removes onload from body', () => {
      const input = '<html><body onload="boom()"><p>hi</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      expect(doc.body.hasAttribute('onload')).toBe(false);
      expect(doc.querySelector('p')?.textContent).toBe('hi');
    });

    it('removes other on* handlers (onerror, onmouseover)', () => {
      const input =
        '<html><body><img src="x" onerror="boom()"><div onmouseover="boom()">hover</div></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      const img = doc.querySelector('img');
      const div = doc.querySelector('div');
      expect(img).not.toBeNull();
      expect(div).not.toBeNull();
      expect(img!.hasAttribute('onerror')).toBe(false);
      expect(div!.hasAttribute('onmouseover')).toBe(false);
      expect(div!.textContent).toBe('hover');
    });
  });

  describe('preserves styles', () => {
    it('preserves <style> tag and its CSS rules', () => {
      const input =
        '<html><head><style>.foo { color: blue; } p { font-size: 14px; }</style></head><body><p class="foo">x</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      const style = doc.querySelector('style');
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('.foo');
      expect(style!.textContent).toContain('color: blue');
      expect(style!.textContent).toContain('font-size: 14px');
    });

    it('preserves inline style="color: red" attribute', () => {
      const input = '<html><body><p style="color: red">red text</p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      const p = doc.querySelector('p');
      expect(p).not.toBeNull();
      expect(p!.getAttribute('style')).toBe('color: red');
    });
  });

  describe('preserves normal content', () => {
    it('keeps <h1>Hello</h1> and <p>foo <span>bar</span></p> intact', () => {
      const input =
        '<html><body><h1>Hello</h1><p>foo <span>bar</span></p></body></html>';
      const out = sanitizeHtml(input);
      const doc = parse(out);
      const h1 = doc.querySelector('h1');
      const p = doc.querySelector('p');
      const span = doc.querySelector('p span');
      expect(h1?.textContent).toBe('Hello');
      expect(p?.textContent).toBe('foo bar');
      expect(span?.textContent).toBe('bar');
    });
  });

  describe('output format', () => {
    it('starts with a <!DOCTYPE html> declaration', () => {
      const input = '<html><body><p>x</p></body></html>';
      const out = sanitizeHtml(input);
      expect(out.startsWith('<!DOCTYPE html>')).toBe(true);
      // Sanity: parses back to a document with our content.
      const doc = parse(out);
      expect(doc.querySelector('p')?.textContent).toBe('x');
    });
  });
});
