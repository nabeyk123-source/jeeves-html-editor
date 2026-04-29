# Jeeves HTML Editor

> 「旦那様、編集なさりたいHTMLファイルをこちらへお預けください。」

## 概要

**Jeeves HTML Editor** は、HTMLファイルをアップロードするだけでテキストをクリック編集できる、ブラウザ完結型の無料Webツールです。

業者に作ってもらったHP/LPを持っているが、ちょっとした文言修正のたびに依頼が必要で不便——そんな中小企業・個人事業主の方向けに設計しました。HTMLの知識は不要です。Wordが使えれば十分です。

本ツールはLP生成サービス **Jeeves** の集客導線として無料公開しています。執事キャラクター「ジーヴス」が丁寧にご案内いたします。

---

## 主な機能

- **ドラッグ＆ドロップでアップロード** — `.html` / `.htm`（5MBまで）
- **クリックでその場編集** — 以下のすべてに対応
  - 標準タグ：`h1`〜`h6`, `p`, `span`, `a`, `button`, `li`, `td`, `th`, `dt`, `dd`
  - テキスト専有要素：`<div>テキストのみ</div>` や `<div>テキスト<br>2行目</div>`
  - テキスト混在要素：`<div>¥2,000 <span>/人</span></div>` の直接テキスト部分
- **キーボード操作**
  - `Enter` — 確定（フォーカスを外す）
  - `Escape` — 取り消し（編集前の内容に戻す）
  - `Shift + Enter` — 改行を挿入して編集継続
- **編集済みHTMLをダウンロード** — `元ファイル名_edited.html` として保存
- **セキュリティサニタイズ** — `<script>`、`<iframe>`、`onclick` 等のインラインハンドラを自動除去

---

## 技術スタック

| 項目 | 採用技術 |
|------|---------|
| フレームワーク | React 18 |
| ビルドツール | Vite 5 |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 3 |
| テスト | Vitest + jsdom |
| パッケージマネージャ | pnpm |

---

## 開発コマンド

```bash
# 依存パッケージのインストール（初回）
pnpm install

# 開発サーバー起動（http://localhost:5173）
pnpm dev

# テスト実行
pnpm test

# 本番ビルド（dist/ に出力）
pnpm build

# ビルド成果物のローカル確認
pnpm preview
```

---

## デプロイ（Cloudflare Pages）

GitHub リポジトリと Cloudflare Pages を連携し、`push` 時に自動デプロイされる構成を想定しています。

| 設定項目 | 値 |
|---------|-----|
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js version | 20 以上 |

---

## ライセンス

MIT

---

*「お仕上げが完了いたしました。どうぞお持ち帰りくださいませ。」*
