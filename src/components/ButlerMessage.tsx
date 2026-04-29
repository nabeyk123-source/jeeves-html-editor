import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  tone?: 'normal' | 'error';
};

export function ButlerMessage({ children, tone = 'normal' }: Props) {
  const isError = tone === 'error';
  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 rounded-lg border ${
        isError
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-butler-cream border-butler-gold/30 text-butler-ink'
      }`}
    >
      <div className="flex-shrink-0">
        <span
          className={`inline-flex w-9 h-9 rounded-full items-center justify-center font-serif text-lg leading-none ${
            isError
              ? 'bg-red-900 text-red-50'
              : 'bg-butler-ink text-butler-gold'
          }`}
        >
          J
        </span>
      </div>
      <div className="pt-0.5">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] mb-1 opacity-60">
          Jeeves
        </div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
