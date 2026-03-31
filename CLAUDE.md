# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

reporter-view 是一個 Vue.js 前端專案，用於整理並展示 `daily-report/` 目錄中的市場分析報告。這些報告是由其他工具產生的自包含 HTML 檔案，本專案提供一個統一的瀏覽介面來閱讀和管理它們。

## Data Source

### daily-report/ 目錄
- 包含自包含的 HTML 市場分析報告（內嵌 CSS，無外部依賴）
- 檔名格式：`market-report-{TOPIC}-{YYYYMMDD}.html`
- 主題範圍：台股（TWII, TAIEX, TW）、美股（US, US-MARKET, NKE, US10stocks）、產業（GREEN-ENERGY, TAIEX-SP500）
- 報告語言：繁體中文為主，部分英文
- 每份報告約 400-960 行 HTML，20-50KB
- 報告會持續新增，前端需能動態讀取此目錄

### HTML 報告結構
- 所有報告共用相同的 CSS 樣式結構（`.report-header`, `.report-body`, `.section-card` 等）
- 報告標題在 `<title>` 標籤中，格式為「{報告名稱} – {YYYY/MM/DD}」
- 每份報告的 header 包含：asset-badge（資產類型標籤）、報告標題、日期等 meta 資訊

## Tech Stack

- **框架**：Vue 3 + TypeScript + Vite
- **路由**：vue-router（Hash mode）
- **功能**：報告列表瀏覽、分類篩選（台股/美股/產業）、日期篩選、關鍵字搜尋、iframe 報告檢視
- **語言**：繁體中文（台灣用語）

## Development Commands

```bash
# 安裝依賴
npm install

# 開發伺服器（會自動產生報告索引）
npm run dev

# 正式建置（含 TypeScript 型別檢查）
npm run build

# 預覽正式建置結果
npm run preview

# 僅重新產生報告索引
npm run gen-index
```

## Project Structure

```
reporter-view/
├── daily-report/              # 市場分析 HTML 報告（資料來源）
├── scripts/
│   └── generate-index.mjs     # 建置時掃描報告產生索引 JSON
├── src/
│   ├── assets/main.css        # 全域 CSS 變數與樣式
│   ├── components/
│   │   ├── AppHeader.vue      # 頂部導覽列
│   │   ├── FilterBar.vue      # 分類/日期/搜尋篩選列
│   │   └── ReportCard.vue     # 報告卡片元件
│   ├── composables/
│   │   └── useReports.ts      # 報告載入與篩選邏輯
│   ├── data/
│   │   └── report-index.json  # 自動產生的報告索引（勿手動編輯）
│   ├── router/index.ts        # Vue Router 設定
│   ├── types/report.ts        # ReportMeta 型別定義
│   ├── views/
│   │   ├── ReportList.vue     # 報告列表頁
│   │   └── ReportViewer.vue   # 報告檢視頁（iframe）
│   ├── App.vue
│   └── main.ts
├── public/
│   ├── favicon.svg
│   └── icons.svg              # SVG sprite（分類圖示）
└── index.html
```

## Architecture Notes

- **iframe 而非 v-html**：報告是完整 HTML 文件含全域樣式，iframe 提供樣式隔離
- **建置時索引**：`scripts/generate-index.mjs` 在 dev/build 前自動掃描 `daily-report/` 產生 JSON 索引
- **Vite 插件複製報告**：`vite.config.ts` 含自訂插件，將 `daily-report/` 複製到 `dist/` 目錄
- **分類邏輯**：TWII/TAIEX/TW → 台股，US/US-MARKET/NKE/US10stocks → 美股，其餘 → 產業
