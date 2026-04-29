import { useState } from 'react';

type SectionId = 'privacy' | 'terms';

const SECTIONS = [
  {
    id: 'privacy' as SectionId,
    title: 'プライバシーについて',
    content: (
      <p>
        当ツールはお客様のHTMLファイルをサーバーに送信・保存いたしません。
        すべての処理はお客様のブラウザ内で完結します。
        アクセス解析等の目的で、Cloudflareによる匿名のアクセスログが記録される場合があります。
      </p>
    ),
  },
  {
    id: 'terms' as SectionId,
    title: 'ご利用にあたって',
    content: (
      <>
        <p className="mb-1">本ツールは無料でご利用いただけますが、以下の点にご同意の上ご利用ください。</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>編集後のHTMLファイルの動作・表示について、当方は一切の保証をいたしません</li>
          <li>本ツールの利用により生じた損害について、当方は責任を負いません</li>
          <li>編集前のファイルのバックアップはお客様ご自身でお願いいたします</li>
        </ul>
      </>
    ),
  },
] as const;

export function Footer() {
  const [open, setOpen] = useState<SectionId | null>(null);

  const toggle = (id: SectionId) => setOpen((prev) => (prev === id ? null : id));

  return (
    <footer className="mt-auto pt-8 pb-6 px-6 text-xs text-butler-ink/40 max-w-2xl mx-auto w-full">
      <div className="border-t border-butler-ink/10 pt-4 space-y-1">
        {SECTIONS.map(({ id, title, content }) => (
          <div key={id}>
            <button
              type="button"
              onClick={() => toggle(id)}
              className="flex items-center gap-1 hover:text-butler-ink/70 transition-colors"
              aria-expanded={open === id}
            >
              <span
                className="inline-block transition-transform duration-200"
                style={{ transform: open === id ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                ▶
              </span>
              {title}
            </button>
            {open === id && (
              <div className="mt-1.5 mb-2 pl-4 leading-relaxed text-butler-ink/50">
                {content}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-butler-ink/30">© 2026 Jeeves HTML Editor</p>
    </footer>
  );
}
