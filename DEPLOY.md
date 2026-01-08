# Web公開ガイド

このアプリをWeb上に公開する方法を説明します。データはすべてユーザーのブラウザ（localStorage）に保存されるため、プライバシーリスクはありません。

## 前提条件

- GitHubアカウント（GitHub Pagesを使用する場合）
- Node.js 18以上がインストールされていること

## デプロイ方法

### 方法1: Netlify（推奨・最も簡単）

1. **Netlifyアカウントを作成**
   - https://www.netlify.com/ にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをGitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```

3. **Netlifyでデプロイ**
   - Netlifyダッシュボードで「Add new site」→「Import an existing project」を選択
   - GitHubを選択し、リポジトリを選択
   - ビルド設定は自動検出されます（`netlify.toml`が使用されます）
   - 「Deploy site」をクリック

4. **完了**
   - 数分でデプロイが完了します
   - `https://your-app-name.netlify.app` のようなURLでアクセス可能になります

### 方法2: Vercel

1. **Vercelアカウントを作成**
   - https://vercel.com/ にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをGitHubにプッシュ**（方法1の手順2を参照）

3. **Vercelでデプロイ**
   - Vercelダッシュボードで「Add New Project」を選択
   - GitHubリポジトリを選択
   - フレームワークプリセットは「Vite」を選択
   - 「Deploy」をクリック

4. **完了**
   - 数分でデプロイが完了します
   - `https://your-app-name.vercel.app` のようなURLでアクセス可能になります

### 方法3: GitHub Pages

1. **GitHubリポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```

2. **GitHub Pagesを有効化**
   - リポジトリの「Settings」→「Pages」に移動
   - Sourceを「GitHub Actions」に設定

3. **自動デプロイ**
   - `.github/workflows/deploy.yml` が自動的に使用されます
   - `main`ブランチにプッシュするたびに自動デプロイされます

4. **完了**
   - 数分でデプロイが完了します
   - `https://your-username.github.io/your-repo-name` のようなURLでアクセス可能になります

## カスタムドメインの設定（オプション）

各ホスティングサービスでカスタムドメインを設定できます：

- **Netlify**: Site settings → Domain management
- **Vercel**: Project settings → Domains
- **GitHub Pages**: Repository settings → Pages → Custom domain

## 注意事項

### プライバシーについて

- ✅ すべてのデータはユーザーのブラウザ（localStorage）に保存されます
- ✅ サーバーにデータが送信されることはありません
- ✅ 外部API（Google Generative AIなど）は現在使用されていません
- ✅ 将来的にAI機能を追加する場合は、APIキーを環境変数で管理してください

### 環境変数の設定（将来のAI機能用）

AI機能を追加する場合、環境変数を設定する必要があります：

**Netlify:**
- Site settings → Environment variables

**Vercel:**
- Project settings → Environment Variables

**GitHub Pages:**
- Repository settings → Secrets and variables → Actions

### ビルドエラーの対処

ビルドが失敗する場合：

1. ローカルでビルドを確認
   ```bash
   npm run build
   ```

2. エラーログを確認
   - 各ホスティングサービスのビルドログを確認

3. 依存関係を再インストール
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## トラブルシューティング

### ルーティングが正しく動作しない

SPA（Single Page Application）のため、すべてのルートを`index.html`にリダイレクトする必要があります。各ホスティングサービスの設定ファイル（`netlify.toml`、`vercel.json`）が正しく設定されているか確認してください。

### アセットが読み込まれない

Viteのビルド設定を確認してください。`vite.config.ts`で`base`パスを設定する必要がある場合があります：

```typescript
export default defineConfig({
  base: '/your-repo-name/', // GitHub Pagesの場合
  plugins: [react()],
});
```

## サポート

問題が発生した場合は、各ホスティングサービスのドキュメントを参照してください：

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
