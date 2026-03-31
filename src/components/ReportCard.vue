<script setup lang="ts">
import type { ReportMeta } from '@/types/report'
import { useReadHistory } from '@/composables/useReadHistory'
import { useBookmarks } from '@/composables/useBookmarks'

/**
 * 報告卡片元件
 * 顯示報告摘要資訊，整張卡片可點擊跳轉至報告檢視頁。
 * 支援收藏功能（星號按鈕）、摘要預覽、主題可點擊篩選。
 * 已讀報告會以降調視覺呈現（降低透明度、標題變次要色、顯示「已讀」標記）。
 */

const props = defineProps<{
  report: ReportMeta
}>()

const emit = defineEmits<{
  /** 點擊主題 tag 時觸發，傳出主題代碼 */
  (e: 'select-topic', topic: string): void
}>()

const { isRead } = useReadHistory()
const { isBookmarked, toggleBookmark } = useBookmarks()

/** 分類標籤對應的中文名稱 */
const categoryLabels: Record<string, string> = {
  tw: '台股',
  us: '美股',
  sector: '產業',
}

/**
 * 格式化日期為中文友善格式
 */
function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/** 點擊收藏按鈕，阻止事件冒泡避免觸發 RouterLink */
function onToggleBookmark(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  toggleBookmark(props.report.filename)
}

/** 點擊主題 tag，阻止事件冒泡並 emit 事件 */
function onSelectTopic(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  emit('select-topic', props.report.topic)
}
</script>

<template>
  <!-- 報告卡片，整張可點擊；已讀報告加上降調樣式 -->
  <RouterLink
    :to="{ name: 'report-viewer', params: { filename: report.filename } }"
    class="report-card"
    :class="{ 'report-card--read': isRead(report.filename) }"
  >
    <!-- 頂部：分類標籤 + 已讀標記 + 收藏按鈕 + 日期 -->
    <div class="report-card__top">
      <div class="report-card__top-left">
        <span
          class="report-card__category"
          :class="`report-card__category--${report.category}`"
        >
          {{ categoryLabels[report.category] }}
        </span>
        <!-- 已讀標記：僅在已讀時顯示 -->
        <span v-if="isRead(report.filename)" class="report-card__read-badge">已讀</span>
      </div>
      <div class="report-card__top-right">
        <!-- 收藏按鈕 -->
        <button
          class="report-card__bookmark btn-press"
          :class="{ 'report-card__bookmark--active': isBookmarked(report.filename) }"
          @click="onToggleBookmark"
          :title="isBookmarked(report.filename) ? '取消收藏' : '加入收藏'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" :fill="isBookmarked(report.filename) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <time class="report-card__date">{{ formatDate(report.date) }}</time>
      </div>
    </div>

    <!-- 主標題 -->
    <h3 class="report-card__title">{{ report.heading }}</h3>

    <!-- badge 副標 -->
    <p class="report-card__badge">{{ report.badge }}</p>

    <!-- 摘要預覽 -->
    <p v-if="report.summary" class="report-card__summary">{{ report.summary }}</p>

    <!-- 底部：主題 tag（可點擊篩選同主題） -->
    <div class="report-card__footer">
      <button class="report-card__topic" @click="onSelectTopic">{{ report.topic }}</button>
    </div>
  </RouterLink>
</template>

<style scoped>
.report-card {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.3s ease,
              border-color 0.3s ease,
              background 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--color-border);
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent-blue);
  background: #fafcff;
}

.report-card:active {
  transform: translateY(-1px) scale(0.97);
  transition-duration: 0.1s;
}

/* 頂部列：分類 + 日期 */
.report-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 分類標籤 */
.report-card__category {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.report-card__category--tw {
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
}

.report-card__category--us {
  color: var(--color-tag-us);
  background: var(--color-tag-us-bg);
}

.report-card__category--sector {
  color: var(--color-tag-sector);
  background: var(--color-tag-sector-bg);
}

/* 日期 */
.report-card__date {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 主標題 */
.report-card__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
  color: var(--color-text);
}

/* badge 副標 */
.report-card__badge {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  flex: 1;
}

/* 底部 */
.report-card__footer {
  display: flex;
  align-items: center;
  margin-top: auto;
}

/* 主題 tag（可點擊篩選） */
.report-card__topic {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-navy);
  background: var(--color-bg);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s ease, color 0.2s ease;
}

.report-card__topic:hover {
  background: rgba(30, 61, 110, 0.18);
  color: var(--color-navy-dark);
}

.report-card:hover .report-card__topic {
  background: rgba(30, 61, 110, 0.1);
}

/* 摘要文字 */
.report-card__summary {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── 頂部左側容器（分類標籤 + 已讀標記） ── */
.report-card__top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 頂部右側容器（收藏 + 日期） */
.report-card__top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 收藏按鈕 */
.report-card__bookmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  transition: color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  opacity: 0;
}

.report-card:hover .report-card__bookmark,
.report-card__bookmark--active {
  opacity: 1;
}

.report-card__bookmark:hover {
  color: #f39c12;
  transform: scale(1.15);
}

.report-card__bookmark--active {
  color: #f39c12;
}

/* ── 已讀狀態樣式 ── */

/** 已讀標記文字：小型灰色標籤，顯示於分類標籤旁 */
.report-card__read-badge {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-border);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
  line-height: 1.4;
}

/** 已讀卡片整體降調：降低透明度 */
.report-card--read {
  opacity: 0.7;
}

/** 已讀卡片標題：使用次要文字色 */
.report-card--read .report-card__title {
  color: var(--color-text-secondary);
}

/*
 * ── 深色模式 scoped 覆蓋 ──
 */

/*
 * 已讀標記 badge：
 * 原本 background: --color-border (#30363d)，color: --color-text-secondary (#8b949e)
 * 對比約 2.8:1，不合格
 * 修正：加深背景至 #21262d，文字提亮至 #a0aec0，對比約 4.6:1
 */
:global([data-theme="dark"]) .report-card__read-badge {
  background: #21262d;
  color: #a0aec0;
  border: 1px solid #30363d;
}

/*
 * 已讀卡片降調：全域規則已將 opacity 從 0.7 改為 0.85
 * 這裡確保在深色模式下標題顏色使用明確值
 */
:global([data-theme="dark"]) .report-card--read {
  opacity: 0.85;
}

:global([data-theme="dark"]) .report-card--read .report-card__title {
  color: #6e7f8d;
}

/*
 * 收藏按鈕 active 狀態：金色在深色背景對比 #f0a332 vs transparent ≈ 6.8:1
 */
:global([data-theme="dark"]) .report-card__bookmark--active {
  color: #f0a332;
}

:global([data-theme="dark"]) .report-card__bookmark:hover {
  color: #f0a332;
}
</style>
