import { useMemo, type RefObject } from 'react';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { injectEditor } from '../lib/injectEditor';
import { markHiddenElements } from '../lib/revealHidden';

type Props = {
  html: string;
  iframeRef: RefObject<HTMLIFrameElement>;
  onReady?: (hiddenCount: number) => void;
};

export function EditorFrame({ html, iframeRef, onReady }: Props) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html]);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    injectEditor(doc);
    const hiddenCount = markHiddenElements(doc);
    onReady?.(hiddenCount);
  };

  return (
    <iframe
      ref={iframeRef}
      srcDoc={sanitized}
      onLoad={handleLoad}
      title="編集中のHTML"
      className="w-full flex-1 min-h-0 border border-butler-ink/10 rounded-lg bg-white shadow-sm"
    />
  );
}
