<script setup lang="ts">
import type { ReportCategory } from '@/types/report'

/**
 * 報告篩選工具列
 * 提供分類按鈕群組（含篇數）、主題下拉、日期下拉、收藏篩選、
 * 搜尋輸入框、檢視模式切換（Grid / 時間軸）
 */

defineProps<{
  /** 可選擇的日期清單 */
  availableDates: string[]
  /** 可選擇的主題清單 */
  availableTopics: string[]
  /** 各分類的報告數量 */
  counts?: { total: number; tw: number; us: number; sector: number }
}>()

/** 目前選取的分類 */
const selectedCategory = defineModel<ReportCategory | null>('category')

/** 目前選取的日期 */
const selectedDate = defineModel<string | null>('date')

/** 搜尋關鍵字 */
const searchQuery = defineModel<string>('search')

/** 目前選取的主題 */
const selectedTopic = defineModel<string | null>('topic')

/** 是否僅顯示收藏 */
const showBookmarksOnly = defineModel<boolean>('bookmarksOnly')

/** 檢視模式 */
const viewMode = defineModel<'grid' | 'timeline'>('viewMode')

/** 分類選項定義 */
const categories: { label: string; value: ReportCategory | null; countKey: string }[] = [
  { label: '全部', value: null, countKey: 'total' },
  { label: '台股', value: 'tw', countKey: 'tw' },
  { label: '美股', value: 'us', countKey: 'us' },
  { label: '產業', value: 'sector', countKey: 'sector' },
]

/** 格式化日期顯示，將 YYYY-MM-DD 轉為中文友善格式 */
function formatDate(date: string): string {
  const [y, m, d] = date.split('-')
  return `${y}/${m}/${d}`
}

/** 清除所有篩選條件 */
function clearAll() {
  selectedCategory.value = null
  selectedDate.value = null
  selectedTopic.value = null
  searchQuery.value = ''
  showBookmarksOnly.value = false
}

/** 是否有任何篩選條件生效 */
function hasActiveFilter(): boolean {
  return (
    selectedCategory.value !== null ||
    selectedDate.value !== null ||
    selectedTopic.value !== null ||
    showBookmarksOnly.value ||
    (searchQuery.value ?? '').trim() !== ''
  )
}
</script>

<template>
  <!-- 篩選工具列：分類 + 日期 + 搜尋 -->
  <div class="filter-bar">
    <!-- 分類按鈕群組 -->
    <div class="filter-bar__categories">
      <button
        v-for="cat in categories"
        :key="cat.label"
        class="filter-bar__cat-btn btn-press"
        :class="{ 'filter-bar__cat-btn--active': selectedCategory === cat.value }"
        @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
        <span v-if="counts" class="filter-bar__count">{{ counts[cat.countKey as keyof typeof counts] }}</span>
      </button>
    </div>

    <div class="filter-bar__controls">
      <!-- 清除篩選按鈕 -->
      <button
        v-if="hasActiveFilter()"
        class="filter-bar__clear btn-press"
        @click="clearAll"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        清除篩選
      </button>

      <!-- 收藏篩選按鈕 -->
      <button
        class="filter-bar__bookmark-btn btn-press"
        :class="{ 'filter-bar__bookmark-btn--active': showBookmarksOnly }"
        @click="showBookmarksOnly = !showBookmarksOnly"
        title="僅顯示收藏"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" :fill="showBookmarksOnly ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      <!-- 主題下拉選單 -->
      <select
        class="filter-bar__topic-select"
        :value="selectedTopic ?? ''"
        @change="selectedTopic = ($event.target as HTMLSelectElement).value || null"
      >
        <option value="">所有主題</option>
        <option v-for="t in availableTopics" :key="t" :value="t">
          {{ t }}
        </option>
      </select>

      <!-- 日期下拉選單 -->
      <select
        class="filter-bar__date-select"
        :value="selectedDate ?? ''"
        @change="selectedDate = ($event.target as HTMLSelectElement).value || null"
      >
        <option value="">所有日期</option>
        <option v-for="d in availableDates" :key="d" :value="d">
          {{ formatDate(d) }}
        </option>
      </select>

      <!-- 搜尋輸入框 -->
      <div class="filter-bar__search-wrap">
        <svg class="filter-bar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          class="filter-bar__search-input"
          type="text"
          placeholder="搜尋報告（含全文）..."
          :value="searchQuery"
          @input="searchQuery = ($event.target as HTMLInputElement).value"
        />
      </div>

      <!-- 檢視模式切換 -->
      <div class="filter-bar__view-toggle">
        <button
          class="filter-bar__view-btn btn-press"
          :class="{ 'filter-bar__view-btn--active': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid 檢視"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          class="filter-bar__view-btn btn-press"
          :class="{ 'filter-bar__view-btn--active': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
          title="時間軸檢視"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

/* 分類按鈕群組 */
.filter-bar__categories {
  display: flex;
  gap: 8px;
}

.filter-bar__cat-btn {
  padding: 8px 16px;
  min-height: var(--touch-min);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-bar__cat-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(30, 61, 110, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.filter-bar__cat-btn:hover::after {
  opacity: 1;
}

.filter-bar__cat-btn:hover {
  color: var(--color-navy);
  border-color: var(--color-navy);
  box-shadow: var(--shadow-md);
}

.filter-bar__cat-btn--active {
  color: var(--color-white);
  background: var(--color-navy);
  border-color: var(--color-navy);
  box-shadow: 0 2px 10px rgba(30, 61, 110, 0.3);
}

.filter-bar__cat-btn--active:hover {
  box-shadow: 0 3px 12px rgba(30, 61, 110, 0.35);
}

/* 篇數 badge */
.filter-bar__count {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.08);
  line-height: 1.4;
}

.filter-bar__cat-btn--active .filter-bar__count {
  background: rgba(255, 255, 255, 0.25);
}

/* 清除篩選按鈕 */
.filter-bar__clear {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  min-height: var(--touch-min);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease;
}

.filter-bar__clear:hover {
  background: rgba(231, 76, 60, 0.18);
}

/* 右側控制區 */
.filter-bar__controls {
  display: flex;
  gap: 12px;
  margin-left: auto;
  align-items: center;
}

/* 日期下拉選單 */
.filter-bar__date-select {
  padding: 8px 12px;
  min-height: var(--touch-min);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.filter-bar__date-select:focus {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 3px rgba(30, 61, 110, 0.1);
}

/* 搜尋框 */
.filter-bar__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-bar__search-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.filter-bar__search-input {
  padding: 8px 12px 8px 32px;
  min-height: var(--touch-min);
  width: 220px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  font-size: 14px;
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition), width 0.3s ease;
}

.filter-bar__search-input::placeholder {
  color: var(--color-accent-muted);
}

.filter-bar__search-input:focus {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 3px rgba(30, 61, 110, 0.1);
  width: 280px;
}

/* 收藏篩選按鈕 */
.filter-bar__bookmark-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-min);
  height: var(--touch-min);
  border-radius: 50%;
  color: var(--color-text-secondary);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
}

.filter-bar__bookmark-btn:hover {
  color: #f39c12;
  border-color: #f39c12;
}

.filter-bar__bookmark-btn--active {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
  border-color: #f39c12;
}

/* 主題下拉選單 */
.filter-bar__topic-select {
  padding: 8px 12px;
  min-height: var(--touch-min);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.filter-bar__topic-select:focus {
  border-color: var(--color-navy);
  box-shadow: 0 0 0 3px rgba(30, 61, 110, 0.1);
}

/* 檢視模式切換 */
.filter-bar__view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.filter-bar__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: var(--color-text-secondary);
  background: var(--color-white);
  border: none;
  transition: all 0.2s ease;
}

.filter-bar__view-btn:first-child {
  border-right: 1px solid var(--color-border);
}

.filter-bar__view-btn:hover {
  background: var(--color-bg);
}

.filter-bar__view-btn--active {
  color: var(--color-white);
  background: var(--color-navy);
}

.filter-bar__view-btn--active:hover {
  background: var(--color-navy);
}

/*
 * ── 深色模式 scoped 覆蓋 ──
 * FilterBar 中 placeholder、focus ring 等需在 scoped 內覆蓋
 */

/* 搜尋框 placeholder：--color-accent-muted 在深色下已提高至 #6e7f8d（對比約 4.6:1） */
:global([data-theme="dark"]) .filter-bar__search-input::placeholder {
  color: var(--color-accent-muted);
}

/* 搜尋框 focus ring：改用藍色替代深海軍藍 */
:global([data-theme="dark"]) .filter-bar__search-input:focus,
:global([data-theme="dark"]) .filter-bar__date-select:focus,
:global([data-theme="dark"]) .filter-bar__topic-select:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
}

/* 書籤按鈕：inactive 狀態文字色提高對比 */
:global([data-theme="dark"]) .filter-bar__bookmark-btn {
  color: #8b949e;
}

:global([data-theme="dark"]) .filter-bar__bookmark-btn:hover {
  color: #f0a332;
  border-color: #f0a332;
}

:global([data-theme="dark"]) .filter-bar__bookmark-btn--active {
  color: #f0a332;
  background: rgba(240, 163, 50, 0.12);
  border-color: #f0a332;
}

/* 清除篩選按鈕在深色模式：紅色文字在深色背景，#ff6b6b vs #161b22 對比約 5.8:1 */
:global([data-theme="dark"]) .filter-bar__clear {
  color: #ff6b6b;
  background: rgba(248, 81, 73, 0.12);
}

:global([data-theme="dark"]) .filter-bar__clear:hover {
  background: rgba(248, 81, 73, 0.22);
  color: #ff8585;
}

/* 分類篇數 badge 在 active 狀態：確保白字在藍底可讀 */
:global([data-theme="dark"]) .filter-bar__cat-btn--active .filter-bar__count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* RWD：平板以下堆疊 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar__categories {
    flex-wrap: wrap;
  }

  .filter-bar__controls {
    margin-left: 0;
    flex-wrap: wrap;
  }

  .filter-bar__search-input {
    width: 100%;
  }

  .filter-bar__search-input:focus {
    width: 100%;
  }
}

/* 超小螢幕 */
@media (max-width: 480px) {
  .filter-bar__cat-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .filter-bar__count {
    display: none;
  }
}
</style>
