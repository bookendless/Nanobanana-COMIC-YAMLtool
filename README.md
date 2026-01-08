# Nanobanana-COMIC-YAMLtool

NanobananaProで漫画を出力させるYAMLを支援するツール

## 概要

このツールは、Nanobanana（AI漫画生成ツール）で使用するYAML設定ファイルを簡単に作成・編集するためのWebアプリケーションです。

## 機能

- 📝 フォーマット設定（アスペクト比、向き、スタイルなど）
- 👥 キャラクター管理とシート生成
- 📋 パネル管理とセリフ編集
- 🎨 スタイルガイドラインの設定
- 📄 YAML形式でのエクスポート

## セットアップ

### 必要な環境

- Node.js (v18以上推奨)
- npm または yarn

### インストール

```bash
npm install
```

## 使用方法

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスします。

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## Web公開

このアプリをWeb上に公開する方法については、[DEPLOY.md](./DEPLOY.md)を参照してください。

### 簡単な手順

1. **Netlify（推奨）**
   - https://www.netlify.com/ でアカウント作成
   - GitHubリポジトリを接続
   - 自動デプロイ完了

2. **Vercel**
   - https://vercel.com/ でアカウント作成
   - GitHubリポジトリを接続
   - 自動デプロイ完了

3. **GitHub Pages**
   - リポジトリのSettings → Pagesで有効化
   - GitHub Actionsで自動デプロイ

### アプリの更新方法

GitHubリポジトリと連携している場合、ローカルで変更をコミット・プッシュするだけで自動的にデプロイされます：

```bash
git add .
git commit -m "機能を更新"
git push origin main
```

詳細は[DEPLOY.md](./DEPLOY.md)の「アプリの更新方法」セクションを参照してください。

### プライバシーについて

✅ **すべてのデータはユーザーのブラウザ（localStorage）に保存されます**  
✅ **サーバーにデータが送信されることはありません**  
✅ **プライバシーリスクはありません**

## 技術スタック

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Generative AI

## ライセンス

MIT License

Copyright (c) 2025 詰読(bookendless)


