type Props = {
  fileName: string;
  onReset: () => void;
  onDownload: () => void;
};

export function Toolbar({ fileName, onReset, onDownload }: Props) {
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
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 text-sm rounded border border-butler-paper/25 text-butler-paper/90 hover:bg-butler-paper/10 hover:text-butler-paper transition"
        >
          リセット
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="px-4 py-1.5 text-sm font-medium rounded bg-butler-gold text-butler-ink hover:bg-butler-gold-deep hover:text-butler-paper transition"
        >
          お仕上げいただく
        </button>
      </div>
    </header>
  );
}
