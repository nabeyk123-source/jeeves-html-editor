const STEPS = [
  'HTMLファイルをドラッグ＆ドロップ（またはクリックして選択）',
  '表示されたページのテキストをクリックして編集',
  '「お仕上げいただく」ボタンで編集済みHTMLをダウンロード',
];

const SHORTCUTS = [
  { key: 'Enter', desc: '編集を確定' },
  { key: 'Shift + Enter', desc: '改行' },
  { key: 'Esc', desc: '編集をキャンセル（元に戻す）' },
];

export function HowToUse() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded border border-butler-ink/10 bg-butler-cream px-6 py-5 text-butler-ink/70">
      <h2 className="font-serif text-sm font-semibold text-butler-ink/80 mb-4 tracking-wide">
        使い方
      </h2>

      <ol className="space-y-2.5 mb-5">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-butler-gold/60 text-butler-gold text-xs font-medium flex items-center justify-center mt-px">
              {i + 1}
            </span>
            <span className="text-sm leading-snug">{step}</span>
          </li>
        ))}
      </ol>

      <div className="border-t border-butler-ink/10 pt-4 mb-4">
        <p className="text-xs text-butler-ink/50 mb-2">キーボード操作</p>
        <ul className="space-y-1">
          {SHORTCUTS.map(({ key, desc }) => (
            <li key={key} className="flex items-baseline gap-2 text-xs">
              <kbd className="inline-block px-1.5 py-0.5 rounded bg-butler-ink/8 border border-butler-ink/15 font-mono text-butler-ink/70 whitespace-nowrap">
                {key}
              </kbd>
              <span className="text-butler-ink/55">{desc}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-butler-ink/40 border-t border-butler-ink/10 pt-3">
        ※ HTMLファイルはサーバーに送信されません。すべてブラウザ内で処理されます。
      </p>
    </div>
  );
}
