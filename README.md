# Reporter View

Vue 3 前端應用，提供統一的瀏覽介面來閱讀與管理 `daily-report/` 目錄中的市場分析報告。

## 功能特色

- **報告列表瀏覽** — 以卡片形式展示所有市場分析報告，含標題、日期、摘要
- **分類篩選** — 依市場分類快速切換：台股、美股、產業分析
- **日期篩選** — 依報告日期範圍篩選
- **關鍵字搜尋** — 支援報告標題與內文全文搜尋
- **報告檢視** — 透過 iframe 嵌入顯示完整報告，確保樣式隔離
- **自動索引** — 開發與建置時自動掃描報告目錄產生索引，新增報告即時生效

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 建置工具 | Vite |
| 路由 | Vue Router (Hash mode) |
| 語言 | 繁體中文 |

## 快速開始

### 前置需求

- Node.js 18+
- npm

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開發伺服器啟動時會自動掃描 `daily-report/` 產生報告索引，並監聽該目錄的變動即時更新。

### 建置

```bash
# 正式建置（含 TypeScript 型別檢查）
npm run build

# 預覽建置結果
npm run preview
```

建置產物位於 `dist/`，報告檔案會自動複製至 `dist/daily-report/`。

## 專案結構

```
reporter-view/
├── daily-report/              # 市場分析 HTML 報告（資料來源）
├── scripts/
│   └── generate-index.mjs     # 掃描報告產生索引 JSON
├── src/
│   ├── assets/main.css        # 全域樣式
│   ├── components/
│   │   ├── AppHeader.vue      # 頂部導覽列
│   │   ├── FilterBar.vue      # 分類/日期/搜尋篩選列
│   │   └── ReportCard.vue     # 報告卡片元件
│   ├── composables/
│   │   └── useReports.ts      # 報告載入與篩選邏輯
│   ├── data/
│   │   └── report-index.json  # 自動產生（勿手動編輯）
│   ├── router/index.ts        # 路由設定
│   ├── types/report.ts        # 型別定義
│   ├── views/
│   │   ├── ReportList.vue     # 報告列表頁
│   │   └── ReportViewer.vue   # 報告檢視頁
│   ├── App.vue
│   └── main.ts
├── public/
│   ├── favicon.svg
│   └── icons.svg              # SVG sprite 圖示
└── index.html
```

## 報告資料格式

報告為自包含的 HTML 檔案（內嵌 CSS，無外部依賴），放置於 `daily-report/` 目錄。

**檔名格式：** `market-report-{TOPIC}-{YYYYMMDD}.html`

**分類對應：**

| 分類 | 主題代碼 |
|------|----------|
| 台股 | TWII, TAIEX, TW |
| 美股 | US, US-MARKET, NKE, US10stocks |
| 產業 | GREEN-ENERGY, TAIEX-SP500 等 |

新增報告只需將 HTML 檔案放入 `daily-report/`，開發伺服器會自動偵測並更新索引。

## 部署

Push 到 `main` 後會透過 GitHub Actions 自動建置並部署到 GitHub Pages：

```
https://shot83428.github.io/reporter-view/
```

Actions 的停用、啟用、手動觸發等操作請參考 [GitHub Actions 使用說明](docs/github-actions.md)。

## 其他指令

```bash
# 僅重新產生報告索引（不啟動伺服器）
npm run gen-index
```

## License

Private
