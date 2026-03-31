<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useReports } from '@/composables/useReports'
import { useReadHistory } from '@/composables/useReadHistory'
import { useBookmarks } from '@/composables/useBookmarks'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

/**
 * 報告檢視頁
 * 以 iframe 載入自包含的 HTML 報告，頂部顯示報告資訊與返回按鈕。
 * 進入此頁面時自動將該報告標記為已讀。
 * 支援上一篇/下一篇導航、鍵盤快捷鍵、收藏功能、比較模式入口。
 */

const props = defineProps<{
  /** 報告檔名（不含副檔名），由路由 params 傳入 */
  filename: string
}>()

const { getReport, getAdjacentReports, getSameTopicReports } = useReports()
const { markAsRead } = useReadHistory()
const { isBookmarked, toggleBookmark } = useBookmarks()

/** 當前報告的 meta 資訊 */
const report = computed(() => getReport(props.filename))

/** 上一篇報告（較舊的一篇），隨路由 filename 即時更新 */
const prevReport = computed(() => getAdjacentReports(props.filename).prev)

/** 下一篇報告（較新的一篇），隨路由 filename 即時更新 */
const nextReport = computed(() => getAdjacentReports(props.filename).next)

/** iframe 載入狀態 */
const isLoading = ref(true)

/** 延遲顯示 spinner，避免路由轉場期間透出頓點 */
const showSpinner = ref(false)

/** 啟動 spinner 延遲計時，800ms 後若仍在載入則顯示 spinner */
function startSpinnerDelay() {
  setTimeout(() => {
    if (isLoading.value) showSpinner.value = true
  }, 800)
}

onMounted(() => {
  // 進入檢視頁時，將該報告標記為已讀
  markAsRead(props.filename)
  startSpinnerDelay()
})

/** 當 filename 變化時（上一篇/下一篇導航），重設載入狀態並標記新報告為已讀 */
watch(
  () => props.filename,
  (newFilename) => {
    isLoading.value = true
    showSpinner.value = false
    startSpinnerDelay()
    markAsRead(newFilename)
  },
)

// 鍵盤快捷鍵：左右箭頭切換報告、Escape 返回列表
useKeyboardShortcuts({
  mode: 'viewer',
  getPrev: () => prevReport.value,
  getNext: () => nextReport.value,
})

/** 同主題報告（比較模式用） */
const sameTopicReports = computed(() => {
  if (!report.value) return []
  return getSameTopicReports(report.value.topic, props.filename)
})

/** 比較選單是否展開 */
const showCompareMenu = ref(false)

/** iframe 來源路徑 */
const iframeSrc = computed(() => `${import.meta.env.BASE_URL}daily-report/${props.filename}.html`)

/** 格式化日期為中文友善格式 */
function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/** 分類標籤對應的中文名稱 */
const categoryLabels: Record<string, string> = {
  tw: '台股',
  us: '美股',
  sector: '產業',
}

/** 複製連結按鈕的狀態：true 表示已複製，顯示成功提示 */
const copied = ref(false)

/** 複製當前報告連結到剪貼簿，成功後短暫顯示「已複製！」提示（1.5 秒後恢復） */
async function copyLink() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

/** iframe 載入完成時觸發 */
function onIframeLoad() {
  isLoading.value = false
}
</script>

<template>
  <div class="viewer">
    <!-- 頂部資訊列 -->
    <div class="viewer__toolbar">
      <div class="viewer__toolbar-inner container">
        <!-- 返回按鈕 -->
        <RouterLink to="/" class="viewer__back">
          <svg class="viewer__back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>返回列表</span>
        </RouterLink>

        <!-- 報告標題與日期 -->
        <div v-if="report" class="viewer__info">
          <span
            class="viewer__category"
            :class="`viewer__category--${report.category}`"
          >
            {{ categoryLabels[report.category] }}
          </span>
          <h1 class="viewer__title">{{ report.heading }}</h1>
          <time class="viewer__date">{{ formatDate(report.date) }}</time>
        </div>

        <!-- 上一篇/下一篇導航按鈕 -->
        <div class="viewer__nav">
          <RouterLink
            v-if="prevReport"
            :to="{ name: 'report-viewer', params: { filename: prevReport.filename } }"
            class="viewer__nav-btn"
          >
            <span class="viewer__nav-arrow">&larr;</span>
            <span class="viewer__nav-text">上一篇</span>
          </RouterLink>
          <RouterLink
            v-if="nextReport"
            :to="{ name: 'report-viewer', params: { filename: nextReport.filename } }"
            class="viewer__nav-btn"
          >
            <span class="viewer__nav-text">下一篇</span>
            <span class="viewer__nav-arrow">&rarr;</span>
          </RouterLink>
        </div>

        <!-- 收藏按鈕 -->
        <button
          class="viewer__action-btn btn-press"
          :class="{ 'viewer__action-btn--active': isBookmarked(filename) }"
          @click="toggleBookmark(filename)"
          :title="isBookmarked(filename) ? '取消收藏' : '加入收藏'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(filename) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <!-- 複製連結按鈕 -->
        <button class="viewer__action-btn btn-press" @click="copyLink">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span class="viewer__copy-text">{{ copied ? '已複製！' : '複製連結' }}</span>
        </button>

        <!-- 比較按鈕（僅桌面版，且同主題有其他報告時顯示） -->
        <div v-if="sameTopicReports.length" class="viewer__compare-wrap">
          <button class="viewer__action-btn btn-press" @click="showCompareMenu = !showCompareMenu" title="比較報告">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="8" height="18" rx="1" />
              <rect x="14" y="3" width="8" height="18" rx="1" />
            </svg>
            <span class="viewer__copy-text">比較</span>
          </button>
          <!-- 比較選單 -->
          <div v-if="showCompareMenu" class="viewer__compare-menu">
            <div class="viewer__compare-menu-title">選擇要比較的報告</div>
            <RouterLink
              v-for="r in sameTopicReports"
              :key="r.filename"
              :to="{ name: 'report-compare', params: { filename1: filename, filename2: r.filename } }"
              class="viewer__compare-option"
              @click="showCompareMenu = false"
            >
              <span>{{ r.heading }}</span>
              <time>{{ formatDate(r.date) }}</time>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- iframe 報告內容 -->
    <div class="viewer__content">
      <!-- 載入中 spinner（延遲 800ms 才顯示，避免轉場期間透出頓點） -->
      <div v-if="isLoading && showSpinner" class="viewer__loading">
        <div class="viewer__spinner" />
        <p class="viewer__loading-text">報告載入中...</p>
      </div>

      <iframe
        :src="iframeSrc"
        class="viewer__iframe"
        frameborder="0"
        @load="onIframeLoad"
      />
    </div>
  </div>
</template>

<style scoped>
/* 整體佈局：toolbar + iframe 佔滿剩餘高度 */
.viewer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
}

/* 頂部資訊列 */
.viewer__toolbar {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: 12px 0;
  flex-shrink: 0;
}

.viewer__toolbar-inner {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 返回按鈕 */
.viewer__back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-navy);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s ease, gap 0.25s ease;
  flex-shrink: 0;
}

.viewer__back:hover {
  opacity: 0.7;
}

.viewer__back:active {
  opacity: 0.5;
}

.viewer__back-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.viewer__back:hover .viewer__back-icon {
  transform: translateX(-3px);
}

/* 報告資訊 */
.viewer__info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

/* 分類標籤 */
.viewer__category {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.viewer__category--tw {
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
}

.viewer__category--us {
  color: var(--color-tag-us);
  background: var(--color-tag-us-bg);
}

.viewer__category--sector {
  color: var(--color-tag-sector);
  background: var(--color-tag-sector-bg);
}

/* 報告標題 */
.viewer__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 日期 */
.viewer__date {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* iframe 容器 */
.viewer__content {
  flex: 1;
  position: relative;
  min-height: 0;
}

/* iframe */
.viewer__iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 載入中狀態 */
.viewer__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  z-index: 10;
}

/* spinner 動畫 */
.viewer__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-navy);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.viewer__loading-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 上一篇/下一篇導航區 */
.viewer__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

/* 導航按鈕 */
.viewer__nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-navy);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  white-space: nowrap;
  transition: all 0.2s ease;
  text-decoration: none;
}

.viewer__nav-btn:hover {
  background: var(--color-navy);
  color: var(--color-white);
  border-color: var(--color-navy);
}

/* 工具列動作按鈕（收藏、複製、比較共用） */
.viewer__action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-navy);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
  cursor: pointer;
}

.viewer__action-btn:hover {
  background: var(--color-navy);
  color: var(--color-white);
  border-color: var(--color-navy);
}

.viewer__action-btn--active {
  color: #f39c12;
  border-color: #f39c12;
}

.viewer__action-btn--active:hover {
  background: #f39c12;
  color: var(--color-white);
  border-color: #f39c12;
}

/* 比較按鈕容器 */
.viewer__compare-wrap {
  position: relative;
  flex-shrink: 0;
}

/* 比較選單 */
.viewer__compare-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 50;
  animation: fadeIn 0.2s ease;
}

.viewer__compare-menu-title {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.viewer__compare-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-text);
  text-decoration: none;
  transition: background 0.15s ease;
}

.viewer__compare-option:hover {
  background: var(--color-bg);
}

.viewer__compare-option time {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-left: 12px;
}

/*
 * ── 深色模式 scoped 覆蓋 ──
 * 部分樣式需在 scoped context 中覆蓋，確保選擇器優先級正確
 */

/* viewer toolbar 背景需要明確深色 */
:global([data-theme="dark"]) .viewer__toolbar {
  background: var(--color-white);
}

/* 比較選單：深色背景 + 可讀文字 */
:global([data-theme="dark"]) .viewer__compare-menu {
  background: #1c2433;
  border-color: var(--color-border);
}

:global([data-theme="dark"]) .viewer__compare-menu-title {
  color: #a0aec0;
  border-bottom-color: var(--color-border);
}

:global([data-theme="dark"]) .viewer__compare-option {
  color: var(--color-text);
}

:global([data-theme="dark"]) .viewer__compare-option:hover {
  /* hover 背景：#21262d 在 #1c2433 上有足夠的層次差異 */
  background: #21262d;
}

:global([data-theme="dark"]) .viewer__compare-option time {
  color: #8b949e;
}

/* 收藏 active 狀態：金色在深色背景上對比 #f39c12 vs #161b22 ≈ 6.8:1 */
:global([data-theme="dark"]) .viewer__action-btn--active {
  color: #f0a332;
  border-color: #f0a332;
}

/* RWD：手機版簡化資訊列 */
@media (max-width: 640px) {
  .viewer__toolbar-inner {
    flex-wrap: wrap;
    gap: 8px;
  }

  .viewer__info {
    flex-wrap: wrap;
    gap: 6px;
  }

  .viewer__title {
    font-size: 13px;
    width: 100%;
  }

  /* 手機版導航按鈕只顯示箭頭，隱藏文字 */
  .viewer__nav-text {
    display: none;
  }

  .viewer__nav-btn {
    padding: 6px 10px;
  }

  /* 手機版只顯示 icon，隱藏文字 */
  .viewer__copy-text {
    display: none;
  }

  .viewer__action-btn {
    padding: 6px;
  }

  /* 手機版隱藏比較功能 */
  .viewer__compare-wrap {
    display: none;
  }
}
</style>
