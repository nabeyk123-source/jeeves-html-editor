import { useRef, useState } from 'react';
import { ButlerMessage } from './components/ButlerMessage';
import { DropZone } from './components/DropZone';
import { EditorFrame } from './components/EditorFrame';
import { Toolbar } from './components/Toolbar';
import { exportHtml } from './lib/exportHtml';
import { injectRevealStyle, removeRevealStyle } from './lib/revealHidden';
import type { LoadedFile } from './types';

const INITIAL_MESSAGE = '旦那様、編集なさりたいHTMLファイルをこちらへお預けください。';
const EDITING_MESSAGE =
  'かしこまりました。テキストをクリックして、ご自由に書き換えてくださいませ。Enterキーで確定、Escキーで取り消しでございます。';
const REVEAL_MESSAGE =
  '全てのセクションをお見せしております。金色の枠線がついた部分が、元々非表示だったセクションでございます。';

export default function App() {
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasHidden, setHasHidden] = useState(false);
  const [revealActive, setRevealActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoaded = (loaded: LoadedFile) => {
    setErrorMessage(null);
    setHasHidden(false);
    setRevealActive(false);
    setFile(loaded);
  };

  const handleEditorReady = (hiddenCount: number) => {
    setHasHidden(hiddenCount > 0);
    setRevealActive(false);
  };

  const handleReset = () => {
    const ok = window.confirm('旦那様、編集内容を全て破棄してよろしいでしょうか？');
    if (!ok) return;
    setFile(null);
    setErrorMessage(null);
    setHasHidden(false);
    setRevealActive(false);
  };

  const handleToggleReveal = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    if (revealActive) {
      removeRevealStyle(doc);
      setRevealActive(false);
    } else {
      injectRevealStyle(doc);
      setRevealActive(true);
    }
  };

  const handleDownload = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc || !file) return;

    const html = exportHtml(doc);
    const baseName = file.name.replace(/\.html?$/i, '');
    const downloadName = `${baseName}_edited.html`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!file) {
    return (
      <div className="min-h-full flex flex-col bg-butler-paper">
        <header className="px-6 py-5 border-b border-butler-ink/10">
          <h1 className="font-serif text-2xl text-butler-ink">
            Jeeves <span className="text-butler-gold">HTML Editor</span>
          </h1>
          <p className="text-xs text-butler-ink/60 mt-1 tracking-wide">
            HTMLの軽微な修正を、執事ジーヴスがお手伝いいたします。
          </p>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <DropZone onLoaded={handleLoaded} onError={setErrorMessage} />
            <ButlerMessage tone={errorMessage ? 'error' : 'normal'}>
              {errorMessage ?? INITIAL_MESSAGE}
            </ButlerMessage>
          </div>
          <div className="mt-10 text-xs text-butler-ink/50">
            お試し用サンプル：
            <a
              href="/sample/sample-lp.html"
              download
              className="underline hover:text-butler-gold-deep"
            >
              こちら
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-butler-paper">
      <Toolbar
        fileName={file.name}
        onReset={handleReset}
        onDownload={handleDownload}
        hasHidden={hasHidden}
        revealActive={revealActive}
        onToggleReveal={handleToggleReveal}
      />
      <main className="flex-1 min-h-0 px-4 py-4 flex flex-col gap-3">
        <EditorFrame html={file.html} iframeRef={iframeRef} onReady={handleEditorReady} />
        <ButlerMessage>{revealActive ? REVEAL_MESSAGE : EDITING_MESSAGE}</ButlerMessage>
      </main>
    </div>
  );
}
