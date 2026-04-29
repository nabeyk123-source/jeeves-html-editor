import { useRef, useState, type DragEvent } from 'react';
import type { LoadedFile } from '../types';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type Props = {
  onLoaded: (file: LoadedFile) => void;
  onError: (message: string) => void;
};

export function DropZone({ onLoaded, onError }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const handleFile = (file: File) => {
    if (!/\.html?$/i.test(file.name)) {
      onError('恐れ入りますが、HTMLファイル以外はお受けできかねます。');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onError('恐れ入りますが、5MBを超えるファイルはお受けできかねます。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const html = String(reader.result ?? '');
      onLoaded({ name: file.name, html });
    };
    reader.onerror = () => {
      onError('恐れ入りますが、ファイルの読み込みに失敗いたしました。今一度お試しくださいませ。');
    };
    reader.readAsText(file);
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`group flex flex-col items-center justify-center gap-3 px-8 py-16 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-butler-gold ${
        isDragging
          ? 'border-butler-gold bg-butler-cream scale-[1.01]'
          : 'border-butler-ink/15 bg-white hover:border-butler-gold hover:bg-butler-cream/40'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isDragging ? 'bg-butler-gold text-butler-ink' : 'bg-butler-cream text-butler-gold-deep'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
          aria-hidden
        >
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
        </svg>
      </div>
      <p className="font-serif text-2xl text-butler-ink">
        {isDragging ? 'こちらへお預けくださいませ' : 'HTMLファイルをここへドロップ'}
      </p>
      <p className="text-sm text-butler-ink/60">
        または クリックしてファイルを選択（.html / .htm、5MBまで）
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
