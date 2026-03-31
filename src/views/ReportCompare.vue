<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReports } from '@/composables/useReports'

/**
 * 報告比較頁
 * 以雙 iframe 並排顯示兩篇同主題報告，方便比較不同日期的分析差異。
 * 僅限桌面版使用，手機版建議從 ReportViewer 逐篇閱讀。
 */

const props = defineProps<{
  /** 左側報告檔名 */
  filename1: string
  /** 右側報告檔名 */
  filename2: string
}>()

const { getReport } = useReports()

/** 左側報告 meta */
const report1 = computed(() => getReport(props.filename1))

/** 右側報告 meta */
const report2 = computed(() => getReport(props.filename2))

/** 左側 iframe 來源 */
const iframeSrc1 = computed(() => `${import.meta.env.BASE_URL}daily-report/${props.filename1}.html`)

/** 右側 iframe 來源 */
const iframeSrc2 = computed(() => `${import.meta.env.BASE_URL}daily-report/${props.filename2}.html`)

/** iframe 載入狀態 */
const loading1 = ref(true)
const loading2 = ref(true)

/** 分類標籤對應的中文名稱 */
const categoryLabels: Record<string, string> = {
  tw: '台股',
  us: '美股',
  sector: '產業',
}

/** 格式化日期為中文友善格式 */
function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}
</script>

<template>
  <div class="compare">
    <!-- 頂部工具列 -->
    <div class="compare__toolbar">
      <div class="compare__toolbar-inner container">
        <RouterLink to="/" class="compare__back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>返回列表</span>
        </RouterLink>
        <h1 class="compare__title">報告比較</h1>
      </div>
    </div>

    <!-- 雙欄比較區 -->
    <div class="compare__panels">
      <!-- 左側報告 -->
      <div class="compare__panel">
        <div v-if="report1" class="compare__panel-header">
          <span class="compare__category" :class="`compare__category--${report1.category}`">
            {{ categoryLabels[report1.category] }}
          </span>
          <span class="compare__panel-title">{{ report1.heading }}</span>
          <time class="compare__panel-date">{{ formatDate(report1.date) }}</time>
        </div>
        <div class="compare__iframe-wrap">
          <div v-if="loading1" class="compare__loading">
            <div class="compare__spinner" />
          </div>
          <iframe :src="iframeSrc1" class="compare__iframe" frameborder="0" @load="loading1 = false" />
        </div>
      </div>

      <!-- 分隔線 -->
      <div class="compare__divider" />

      <!-- 右側報告 -->
      <div class="compare__panel">
        <div v-if="report2" class="compare__panel-header">
          <span class="compare__category" :class="`compare__category--${report2.category}`">
            {{ categoryLabels[report2.category] }}
          </span>
          <span class="compare__panel-title">{{ report2.heading }}</span>
          <time class="compare__panel-date">{{ formatDate(report2.date) }}</time>
        </div>
        <div class="compare__iframe-wrap">
          <div v-if="loading2" class="compare__loading">
            <div class="compare__spinner" />
          </div>
          <iframe :src="iframeSrc2" class="compare__iframe" frameborder="0" @load="loading2 = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整體佈局 */
.compare {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
}

/* 頂部工具列 */
.compare__toolbar {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: 10px 0;
  flex-shrink: 0;
}

.compare__toolbar-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.compare__back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-navy);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.compare__back:hover {
  opacity: 0.7;
}

.compare__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

/* 雙欄並排 */
.compare__panels {
  flex: 1;
  display: flex;
  min-height: 0;
}

.compare__panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.compare__divider {
  width: 3px;
  background: var(--color-border);
  flex-shrink: 0;
}

/* 報告標頭 */
.compare__panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.compare__category {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.compare__category--tw {
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
}

.compare__category--us {
  color: var(--color-tag-us);
  background: var(--color-tag-us-bg);
}

.compare__category--sector {
  color: var(--color-tag-sector);
  background: var(--color-tag-sector-bg);
}

.compare__panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.compare__panel-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* iframe */
.compare__iframe-wrap {
  flex: 1;
  position: relative;
  min-height: 0;
}

.compare__iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 載入中 */
.compare__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  z-index: 10;
}

.compare__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-navy);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/*
 * ── 深色模式 scoped 覆蓋 ──
 * compare__toolbar 需在 scoped 中明確深色背景，確保選擇器優先級
 */
:global([data-theme="dark"]) .compare__toolbar {
  background: var(--color-white);
}

:global([data-theme="dark"]) .compare__panel-header {
  background: var(--color-bg);
}

:global([data-theme="dark"]) .compare__divider {
  background: var(--color-border);
}
</style>
