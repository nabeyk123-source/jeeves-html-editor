# HTML簡単エディタ 開発指示書

**プロジェクト名**：Jeeves HTML Editor（ジーヴス HTMLエディタ）
**バージョン**：v1.0
**位置づけ**：LP生成サービス「Jeeves」の集客導線となる無料ツール

---

## 1. プロジェクト概要

### 1.1 目的
業者に作ってもらったHP/LPを持っているが、ちょっとしたテキスト修正のたびに業者に依頼している人向けに、**HTMLファイルをアップするだけでテキストをクリック編集できる**Webツールを提供する。

### 1.2 ターゲットユーザー
- 自社サイトを業者に作ってもらった中小企業・個人事業主
- 営業時間や価格、お知らせ等のちょっとした修正を自分でやりたい人
- HTMLは触れないが、Wordくらいなら使える非エンジニア

### 1.3 ユーザー体験
1. サイトにアクセス → 執事「旦那様、編集なさりたいHTMLファイルをこちらへお預けください」
2. HTMLファイルをドラッグ＆ドロップ
3. ページがそのまま表示される
4. テキスト部分をクリック → その場で編集
5. 「ダウンロード」ボタンで編集済みHTMLを保存

---

## 2. 技術スタック

| レイヤー | 技術 | 備考 |
|---------|------|------|
| フレームワーク | React 18 | |
| ビルドツール | Vite | |
| 言語 | TypeScript | |
| スタイリング | Tailwind CSS | |
| デプロイ先 | Cloudflare Pages | |
| パッケージマネージャ | pnpm | npm/yarnでも可 |

**※状態管理ライブラリは不要**（useStateで足りる規模）
**※ルーティング不要**（シングルページ）

---

## 3. 機能仕様

### 3.1 ファイルアップロード

- ドラッグ＆ドロップエリアを画面中央に配置
- クリックでファイル選択ダイアログも開けるようにする
- 受け付けるファイル：`.html`, `.htm` のみ
- ファイルサイズ上限：5MB
- 複数ファイル同時アップロードは**不可**（1ファイルのみ）
- アップロード後、ファイル内容を`FileReader`で読み込み、文字列として保持

### 3.2 HTMLの表示

- アップロードされたHTMLは`<iframe>`内に表示する
- iframeのsrcdoc属性に編集処理を施したHTML文字列をセット
- iframeは画面の大部分（80%以上）を占めるサイズ
- 上部にツールバー（ファイル名表示、ダウンロードボタン、リセットボタン）

### 3.3 編集機能（コア）

#### 編集対象タグ
以下のタグの**テキストノード**を編集可能にする：
```
h1, h2, h3, h4, h5, h6, p, span, a, button, li, td, th, dt, dd
```

#### 編集の挙動
- 上記タグをクリック → `contenteditable="true"` を付与してその場で編集モードに入る
- **ネストされた要素では、クリックされた最も内側の要素を編集対象にする**（`event.stopPropagation()` を使う）
- 編集中の要素は視覚的にハイライトする（例：`outline: 2px solid #3b82f6` のような薄い枠線）
- ホバー時は別のハイライト（例：薄い背景色）で「ここクリックできます」と示す
- **Enterキー**：編集確定（フォーカスを外す）
- **Escキー**：編集キャンセル（変更を破棄して元に戻す。編集前のテキストを保持しておく必要あり）
- 編集対象タグ以外をクリックしても何も起こらない
- リンク（`<a>`タグ）は編集モード中はクリックで遷移しないようにする

#### 重要な実装ポイント
- iframe内にイベントリスナーを仕込む必要がある
- iframeの`contentDocument`にアクセスして要素を操作する
- iframe内に編集用の最小限のCSS（ハイライト用）を注入する

### 3.4 セキュリティ：スクリプトの無害化

アップロードされたHTMLに含まれる以下を**実行・読み込みしない**：
- `<script>` タグ → 削除する
- インラインイベントハンドラ（`onclick`, `onload` 等）→ 削除する
- `<iframe>` タグ → 削除する
- `<object>`, `<embed>` タグ → 削除する

**※`<style>`タグ、インラインの`style`属性は保持する**（見た目の維持に必要）

実装は`DOMParser`でHTMLをパースしてから上記要素を除去する方式を推奨。

### 3.5 ダウンロード機能

- ツールバーの「ダウンロード」ボタンをクリック
- 編集後のHTML文字列を取得
- **以下の編集用属性を出力時に除去**：
  - `contenteditable` 属性
  - 編集ハイライト用のCSSクラス（もし追加していれば）
  - 編集用に注入したCSS（`<style data-jeeves-editor>` のようなマーカーを付けて識別し、除去）
- ファイル名：`元ファイル名_edited.html`（例：`mysite.html` → `mysite_edited.html`）
- Blob経由でダウンロード処理

### 3.6 リセット機能

- ツールバーの「リセット」ボタン
- 確認ダイアログ：「旦那様、編集内容を全て破棄してよろしいでしょうか？」
- OKなら最初の状態（ファイル未選択）に戻す

---

## 4. UI/UX：執事キャラクター「ジーヴス」

### 4.1 トーン
丁寧で恭しい執事の口調。ユーザーは「旦那様」と呼ぶ。

### 4.2 文言サンプル

| 場面 | 文言例 |
|------|--------|
| 初期画面 | 旦那様、編集なさりたいHTMLファイルをこちらへお預けください |
| ドラッグ中 | こちらへお預けくださいませ |
| 読み込み中 | 少々お待ちくださいませ... |
| 編集モード突入 | かしこまりました。テキストをクリックして、ご自由に書き換えてくださいませ |
| ダウンロードボタン | お仕上げいただく |
| ダウンロード完了 | お仕上げが完了いたしました。どうぞお持ち帰りくださいませ |
| リセット確認 | 旦那様、編集内容を全て破棄してよろしいでしょうか？ |
| エラー（非HTMLファイル） | 恐れ入りますが、HTMLファイル以外はお受けできかねます |
| エラー（サイズ超過） | 恐れ入りますが、5MBを超えるファイルはお受けできかねます |

### 4.3 デザイン方針
- 落ち着いた配色（黒・白・ゴールドのアクセント等、執事らしい上品さ）
- フォントは日本語に Noto Sans JP、英数字に Inter または Playfair Display（見出し）
- 派手なアニメーションは控えめ。上品に
- レスポンシブ対応（PCメイン、スマホでも崩れない程度）

### 4.4 画面構成
```
┌─────────────────────────────────────────┐
│ Jeeves HTML Editor          [リセット] [お仕上げいただく] │ ← ツールバー
├─────────────────────────────────────────┤
│                                         │
│        ┌───────────────────────┐        │
│        │                       │        │
│        │   iframe（HTMLを表示） │        │
│        │   テキストをクリック   │        │
│        │   して編集できる       │        │
│        │                       │        │
│        └───────────────────────┘        │
│                                         │
│  ジーヴス：かしこまりました。テキストを    │
│  クリックして、ご自由に書き換えてくださいませ │
└─────────────────────────────────────────┘
```

ファイル未選択時：
```
┌─────────────────────────────────────────┐
│ Jeeves HTML Editor                      │
├─────────────────────────────────────────┤
│                                         │
│        ┌───────────────────────┐        │
│        │                       │        │
│        │   📄 ここへドロップ    │        │
│        │   または クリックして選択  │       │
│        │                       │        │
│        └───────────────────────┘        │
│                                         │
│  ジーヴス：旦那様、編集なさりたい         │
│  HTMLファイルをこちらへお預けください      │
└─────────────────────────────────────────┘
```

---

## 5. やらないこと（v1スコープ外）

以下はv1では実装しない。指示されてもやらない。

- ❌ 画像の差し替え
- ❌ 色・フォントサイズの変更
- ❌ リンクURLの編集（テキストの編集のみ。URL変更はv2以降）
- ❌ 編集履歴・Undo/Redo
- ❌ 複数ファイル同時編集
- ❌ ファイルの自動保存
- ❌ クラウド保存
- ❌ ユーザー登録・認証
- ❌ 課金・決済
- ❌ AI機能（コピー提案等）
- ❌ HTML構造の変更（要素の追加・削除・並び替え）

---

## 6. 動作確認用サンプル

`public/sample/sample-lp.html` に動作確認用のサンプルLPを1つ用意してください。

要件：
- 飲食店のLP風（カフェ等）
- 編集対象タグを一通り含む（h1, h2, p, a, button, li, td 等）
- ネストされた要素も含める（`<p>`の中に`<span>`等）
- インラインCSSまたは`<style>`タグでそれなりに見栄え良くする
- 画像はUnsplashのURL等を使ってOK（編集時にCORSで読み込めなくても問題ないが、見た目確認用）

サンプルへのリンクを画面下部に小さく配置：「お試し用サンプル：[こちら](sample/sample-lp.html)」

---

## 7. プロジェクト構成（推奨）

```
jeeves-html-editor/
├── public/
│   └── sample/
│       └── sample-lp.html
├── src/
│   ├── App.tsx              # メインコンポーネント
│   ├── main.tsx
│   ├── index.css            # Tailwindのみ
│   ├── components/
│   │   ├── DropZone.tsx     # ドラッグ＆ドロップエリア
│   │   ├── EditorFrame.tsx  # iframe + 編集ロジック
│   │   ├── Toolbar.tsx      # 上部ツールバー
│   │   └── ButlerMessage.tsx # 執事のメッセージ表示
│   ├── lib/
│   │   ├── sanitizeHtml.ts  # スクリプト等を除去
│   │   ├── injectEditor.ts  # 編集用CSS/属性の注入
│   │   └── exportHtml.ts    # ダウンロード用にクリーンアップ
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 8. 開発手順（推奨）

サブエージェントを使って分担する場合の推奨順序：

1. **プロジェクト初期化**：Vite + React + TS + Tailwind のセットアップ
2. **DropZone**：ドラッグ＆ドロップでHTMLを読み込む部分
3. **HTMLサニタイズ**：scriptタグ等を除去するロジック（テスト書きやすい）
4. **EditorFrame**：iframeでHTMLを表示 + contenteditableの注入 + イベントハンドリング
5. **エクスポート機能**：編集用属性を除去してダウンロード
6. **ジーヴスの口調・UI仕上げ**：執事メッセージ、デザイン整え
7. **サンプルHTML作成**
8. **README作成 & Cloudflare Pagesデプロイ設定**

各ステップで動作確認しながら進めること。

---

## 9. 完成基準

以下が全て満たせていればv1完了：

- [ ] HTMLファイルをドラッグ＆ドロップでアップロードできる
- [ ] アップロードしたHTMLがiframe内でそのまま表示される
- [ ] script・iframe等の危険要素が除去されている
- [ ] 編集対象タグをクリックすると、その場で編集できる
- [ ] ネストされた要素では、最も内側の要素が編集対象になる
- [ ] ホバー時とフォーカス時にハイライトされる
- [ ] Enterで確定、Escでキャンセルできる
- [ ] リンク（aタグ）が編集中に遷移しない
- [ ] ダウンロードすると編集内容が反映されたHTMLが取得できる
- [ ] 編集用の属性・CSSがダウンロードファイルから除去されている
- [ ] リセットすると初期状態に戻る
- [ ] UIが執事キャラクターの口調で統一されている
- [ ] サンプルHTMLで一通りの動作確認ができる
- [ ] Cloudflare Pagesにデプロイできる状態になっている
- [ ] READMEが書かれている

---

## 10. 補足

### 10.1 iframeとcontenteditableの実装ヒント

```tsx
// iframeのloadイベント後に内部ドキュメントへアクセス
const iframe = iframeRef.current;
iframe.onload = () => {
  const doc = iframe.contentDocument;
  if (!doc) return;

  // 編集用CSSを注入
  const style = doc.createElement('style');
  style.setAttribute('data-jeeves-editor', '');
  style.textContent = `
    .jeeves-hover { background-color: rgba(59, 130, 246, 0.1); cursor: text; }
    .jeeves-editing { outline: 2px solid #3b82f6; outline-offset: 2px; }
  `;
  doc.head.appendChild(style);

  // 編集対象タグにイベント付与
  const selector = 'h1,h2,h3,h4,h5,h6,p,span,a,button,li,td,th,dt,dd';
  doc.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      (e.currentTarget as HTMLElement).classList.add('jeeves-hover');
    });
    el.addEventListener('mouseleave', (e) => {
      (e.currentTarget as HTMLElement).classList.remove('jeeves-hover');
    });
    el.addEventListener('click', (e) => {
      e.preventDefault();      // aタグの遷移を止める
      e.stopPropagation();     // 親要素への伝播を止める
      const target = e.currentTarget as HTMLElement;
      target.contentEditable = 'true';
      target.classList.add('jeeves-editing');
      target.focus();
      // 編集前のテキストを保持（Esc用）
      target.dataset.jeevesOriginal = target.innerHTML;
    });
    el.addEventListener('keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter') {
        ke.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      } else if (ke.key === 'Escape') {
        const target = e.currentTarget as HTMLElement;
        if (target.dataset.jeevesOriginal !== undefined) {
          target.innerHTML = target.dataset.jeevesOriginal;
        }
        target.blur();
      }
    });
    el.addEventListener('blur', (e) => {
      const target = e.currentTarget as HTMLElement;
      target.contentEditable = 'false';
      target.classList.remove('jeeves-editing');
      delete target.dataset.jeevesOriginal;
    });
  });
};
```

これはあくまで実装ヒント。Claude Code側で適宜整理・改善してOK。

### 10.2 Cloudflare Pagesデプロイ

- ビルドコマンド：`pnpm build`（または`npm run build`）
- 出力ディレクトリ：`dist`
- Node.js バージョン：20 以上

GitHubリポジトリと連携させてpush時に自動デプロイされる構成を想定。

---

以上、よろしくお願いいたします。
