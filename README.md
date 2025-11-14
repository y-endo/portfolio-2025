# Portfolio 2025

フロントエンドエンジニアのポートフォリオサイト

## 技術スタック

- **Astro** - 静的サイトジェネレーター
- **Tailwind CSS v4** - スタイリング（Beta版）
- **ESLint 9** - コード品質管理（Flat Config）
- **Prettier 3** - コードフォーマッター
- **Vite** - ビルドツール
- **JavaScript** - プログラミング言語

## セットアップ

### 依存関係のインストール

```bash
npm install
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:4321` にアクセスしてください。

### コードのリント

```bash
npm run lint
```

### コードのフォーマット

```bash
npm run format
```

## ビルド

### 本番用ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
```

## プロジェクト構造

```
/
├── public/          # 静的ファイル
├── src/
│   ├── layouts/     # レイアウトコンポーネント
│   ├── pages/       # ページファイル
│   └── styles/      # グローバルスタイル
├── astro.config.mjs # Astro設定
├── eslint.config.js # ESLint設定（Flat Config）
├── .prettierrc      # Prettier設定
├── tailwind.config.js # Tailwind CSS設定
└── package.json
```

## コーディング規約

- JavaScript（TypeScriptは使用しません）
- ESLint + Prettierによる自動フォーマット
- セミコロンあり、シングルクォート使用
- タブ幅: 2スペース
- 最大行長: 100文字

## ライセンス

MIT
