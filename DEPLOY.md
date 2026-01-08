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

## アプリの更新方法

ローカルで変更を加えた後、公開アプリを更新する方法を説明します。

### Netlifyで更新する方法

Netlifyでアプリを更新するには、**GitHubリポジトリと連携している場合**と**手動アップロードの場合**で手順が異なります。

#### 方法A: GitHub連携（推奨・自動デプロイ）

GitHubリポジトリと連携している場合、ローカルで変更をコミット・プッシュするだけで自動的にデプロイされます。

1. **ローカルで変更をコミット**
   ```bash
   git add .
   git commit -m "機能を更新"
   ```

2. **GitHubにプッシュ**
   ```bash
   git push origin main
   ```

3. **自動デプロイ**
   - Netlifyが自動的に変更を検知します
   - Netlifyダッシュボードの「Deploys」タブで進行状況を確認できます
   - 通常、数分でデプロイが完了します

4. **デプロイ完了の確認**
   - Netlifyダッシュボードで「Published」ステータスを確認
   - サイトURL（例: `https://zippy-piroshki-ce560a.netlify.app/`）にアクセスして変更を確認

**メリット:**
- ✅ 自動的にデプロイされるため手間がかからない
- ✅ デプロイ履歴が記録される
- ✅ ロールバックが簡単

#### 方法B: 手動デプロイ

GitHubと連携していない場合、または手動でデプロイしたい場合：

1. **ローカルでビルド**
   ```bash
   npm run build
   ```

2. **Netlifyダッシュボードで手動デプロイ**
   - Netlifyダッシュボードにログイン
   - サイトを選択
   - 「Site settings」→「Build & deploy」→「Continuous Deployment」
   - 「Deploy site」→「Deploy manually」を選択
   - `dist`フォルダをドラッグ&ドロップ、または「Browse to upload」で選択

3. **デプロイ完了**
   - 数分でデプロイが完了します

**注意:** 手動デプロイの場合、毎回`dist`フォルダをアップロードする必要があります。

#### 方法C: Netlify CLIを使用（上級者向け）

Netlify CLIをインストールしてコマンドラインからデプロイすることもできます。

1. **Netlify CLIをインストール**
   ```bash
   npm install -g netlify-cli
   ```

2. **ログイン**
   ```bash
   netlify login
   ```

3. **サイトにリンク**
   ```bash
   netlify link
   ```

4. **デプロイ**
   ```bash
   npm run build
   netlify deploy --prod
   ```

### デプロイの確認方法

- **Netlifyダッシュボード**: 「Deploys」タブで最新のデプロイ状況を確認
- **ビルドログ**: デプロイ中の「View build log」でエラーを確認
- **プレビュー**: デプロイ前に「Preview」で確認可能（本番環境に反映される前）

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

### Vercelで更新する方法

VercelもGitHubと連携している場合、自動デプロイが有効です。

1. **ローカルで変更をコミット・プッシュ**
   ```bash
   git add .
   git commit -m "機能を更新"
   git push origin main
   ```

2. **自動デプロイ**
   - Vercelが自動的に変更を検知してデプロイします
   - Vercelダッシュボードで進行状況を確認できます

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

### GitHub Pagesで更新する方法

GitHub PagesはGitHub Actionsを使用している場合、自動デプロイが有効です。

1. **ローカルで変更をコミット・プッシュ**
   ```bash
   git add .
   git commit -m "機能を更新"
   git push origin main
   ```

2. **自動デプロイ**
   - GitHub Actionsが自動的にビルドとデプロイを実行します
   - リポジトリの「Actions」タブで進行状況を確認できます

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
