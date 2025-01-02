# Ogiri Hub

## 📝 概要

大喜利ハブは、オンラインで大喜利を楽しむためのWebアプリケーションです。ユーザーは大喜利のお題を投稿したり、他のユーザーのお題に回答したりすることができます。

### 🌟 主な機能

- 🎭 大喜利スレッドの作成・参加
- 🎨 テキストまたはAI画像生成によるお題の投稿
- ⚡️ リアルタイムでの回答投稿
- 💝 いいね機能
- 👑 ベストアンサーの選定
- 🎪 ユーザープロフィール
- 🏆 バッジシステム

## 🛠️ 技術スタック

- **✨ フロントエンド**

  - 🌈 React 18
  - ⚡️ Vite
  - 💫 Chakra UI
  - 🎭 Framer Motion

- **🏰 バックエンド**
  - 🔥 Firebase
    - 🔐 Authentication
    - 📦 Firestore
    - 💾 Storage

## 🚀 開発環境のセットアップ

1. リポジトリのクローン:

```bash
git clone https://github.com/Team-ONY/TeamONY-Ogiri-Hub.git
```

2. 依存関係のインストール:

```bash
cd ogiri-hub
npm install
```

3. 環境変数の設定:
   開発チームのDiscordにてオーナーから共有される環境変数を`.env.local`ファイルに設定してください。

4. 開発サーバーの起動:

```bash
npm run dev
```

## 🌿 開発フロー

1. 🌱 mainブランチから作業ブランチを作成
2. 💻 実装・テストの実施
3. 🎯 プルリクエストの作成
4. 👀 コードレビュー
5. 🚀 mainブランチへのマージ

### 🌸 ブランチ命名規則

```
<作業prefix>/#<Issue番号>_<変更内容>
```

例）

- ✨ `feat/#123_add-ogiri-event`
- 🐛 `fix/#45_auth-error`
- 📝 `docs/#67_update-readme`

### 🎀 コミットメッセージ規則

```
<作業prefix>: <変更内容を表すアイコン> <変更内容を日本語で>
```

例）

- `feat: ✨ 大喜利イベント作成機能を実装`
- `fix: 🐛 認証エラーを修正`
- `docs: 📝 READMEを更新`
- `refactor: ♻️ コードの重複を削除`
- `style: 🎨 フォーマットを修正`

## 🔍 テスト

```bash
npm run test        # ✨ テストの実行
npm run lint        # 🎯 リントチェック
npm run format      # 🎨 コードフォーマット
```

## 👥 開発チーム

✨ TeamONY ✨
