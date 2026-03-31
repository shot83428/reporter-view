# GitHub Actions 使用說明

本專案使用 GitHub Actions 自動建置並部署到 GitHub Pages。
每次 push 到 `main` 分支時會自動觸發部署。

## 部署網址

```
https://shot83428.github.io/reporter-view/
```

---

## 停用 / 啟用 Workflow

### 透過 CLI（推薦）

```bash
# 停用
gh workflow disable deploy.yml

# 啟用
gh workflow enable deploy.yml
```

### 透過 GitHub 網頁

1. 進入 repo 的 **Actions** 頁籤
2. 左側點選 **Deploy to GitHub Pages**
3. 右上角點 **`...`** 按鈕，選擇 **Disable workflow**
4. 要恢復時同樣位置選 **Enable workflow**

> 停用後 workflow 檔案仍保留在 repo 中，不需要刪除。

---

## 手動觸發部署

workflow 設定了 `workflow_dispatch`，可以不用 push 就手動觸發：

### 透過 CLI

```bash
gh workflow run deploy.yml
```

### 透過 GitHub 網頁

1. 進入 **Actions** 頁籤
2. 左側選 **Deploy to GitHub Pages**
3. 點 **Run workflow** > 選分支 > **Run workflow**

---

## 完全關閉 GitHub Actions

如果想關閉整個 repo 的所有 Actions（不只這個 workflow）：

1. 進入 repo **Settings** > **Actions** > **General**
2. 選擇 **Disable actions**
3. 要恢復時選回 **Allow all actions and reusable workflows**

---

## 查看部署狀態

```bash
# 查看最近的 workflow 執行記錄
gh run list --workflow=deploy.yml

# 查看特定一次執行的詳情
gh run view <run-id>

# 查看 Pages 部署狀態
gh api repos/shot83428/reporter-view/pages --jq '.status'
```

---

## 常見問題

### 部署失敗怎麼辦？

```bash
# 查看失敗的 log
gh run view <run-id> --log-failed
```

常見原因：
- TypeScript 型別錯誤 — 本地先跑 `npm run build` 確認
- 依賴安裝失敗 — 確認 `package-lock.json` 有提交

### 想換部署分支？

修改 `.github/workflows/deploy.yml` 中的觸發條件：

```yaml
on:
  push:
    branches: [你的分支名稱]
```
