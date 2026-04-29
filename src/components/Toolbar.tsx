type Props = {
  fileName: string;
  onReset: () => void;
  onDownload: () => void;
  hasHidden?: boolean;
  revealActive?: boolean;
  onToggleReveal?: () => void;
};

function EyeOpenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function Toolbar({
  fileName,
  onReset,
  onDownload,
  hasHidden = false,
  revealActive = false,
  onToggleReveal,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 bg-butler-ink text-butler-paper border-b border-butler-gold/40 shadow-sm">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="font-serif text-xl whitespace-nowrap">
          Jeeves <span className="text-butler-gold">HTML Editor</span>
        </h1>
        <span className="text-sm text-butler-paper/60 truncate" title={fileName}>
          {fileName}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasHidden && (
          <button
            type="button"
            title="隠れた部分もお見せいたします"
            onClick={onToggleReveal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition ${
              revealActive
                ? 'bg-butler-gold/20 border-butler-gold text-butler-gold'
                : 'border-butler-paper/25 text-butler-paper/80 hover:bg-butler-paper/10 hover:text-butler-paper'
            }`}
          >
            {revealActive ? <EyeOffIcon /> : <EyeOpenIcon />}
            <span>{revealActive ? 'すべて表示中' : 'すべて表示'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 rounded border border-butler-paper/25 text-butler-paper/90 hover:bg-butler-paper/10 hover:text-butler-paper transition leading-tight text-center"
        >
          <span className="block text-sm">リセット</span>
          <span className="block text-xs opacity-60">（最初から）</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="px-4 py-1.5 font-medium rounded bg-butler-gold text-butler-ink hover:bg-butler-gold-deep hover:text-butler-paper transition leading-tight text-center"
        >
          <span className="block text-sm">お仕上げいただく</span>
          <span className="block text-xs opacity-70">（ダウンロード）</span>
        </button>
      </div>
    </header>
  );
}
