<script setup lang="ts">
import FilterBar from '@/components/FilterBar.vue'
import ReportCard from '@/components/ReportCard.vue'
import { useReports } from '@/composables/useReports'
import { useReadHistory } from '@/composables/useReadHistory'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import type { ReportCategory } from '@/types/report'

/**
 * 報告列表頁（首頁）
 * 包含 Hero 橫幅、最新報告精選、篩選工具列、報告卡片 Grid、時間軸檢視
 */

const {
  selectedCategory,
  selectedDate,
  searchQuery,
  selectedTopic,
  showBookmarksOnly,
  viewMode,
  availableDates,
  availableTopics,
  filteredReports,
  timelineGroups,
  reportStats,
  latestReport,
} = useReports()

const { isRead } = useReadHistory()

// 列表頁鍵盤快捷鍵：`/` 聚焦搜尋框
useKeyboardShortcuts({ mode: 'list' })

/** 分類統計標籤 */
const statItems = [
  { label: '台股', key: 'tw' as const, cssClass: 'hero-stat--tw' },
  { label: '美股', key: 'us' as const, cssClass: 'hero-stat--us' },
  { label: '產業', key: 'sector' as const, cssClass: 'hero-stat--sector' },
]

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

/** 點擊統計卡片：設定分類篩選並滾動到報告列表 */
function filterByCategory(category: ReportCategory | null) {
  selectedCategory.value = category
  document.getElementById('all-reports')?.scrollIntoView({ behavior: 'smooth' })
}

/** 清除所有篩選條件 */
function clearFilters() {
  selectedCategory.value = null
  selectedDate.value = null
  selectedTopic.value = null
  searchQuery.value = ''
  showBookmarksOnly.value = false
}

/** 點擊卡片上的主題 tag：篩選同主題 */
function onSelectTopic(topic: string) {
  selectedTopic.value = topic
  document.getElementById('all-reports')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="report-list">
    <!-- Hero 橫幅 -->
    <section class="hero">
      <div class="hero__inner container">
        <h1 class="hero__title">市場分析報告</h1>
        <p class="hero__subtitle">台股、美股、產業分析一站掌握</p>

        <!-- 統計數字列（可點擊篩選） -->
        <div class="hero__stats">
          <button class="hero-stat hero-stat--total btn-press" @click="filterByCategory(null)">
            <span class="hero-stat__number">{{ reportStats.total }}</span>
            <span class="hero-stat__label">份報告</span>
          </button>
          <button
            v-for="item in statItems"
            :key="item.key"
            class="hero-stat btn-press"
            :class="item.cssClass"
            @click="filterByCategory(item.key)"
          >
            <span class="hero-stat__number">{{ reportStats[item.key] }}</span>
            <span class="hero-stat__label">{{ item.label }}</span>
          </button>
        </div>

        <p v-if="reportStats.latestDate" class="hero__latest">
          最近更新：{{ formatDate(reportStats.latestDate) }}
        </p>
      </div>
    </section>

    <!-- 最新報告精選 -->
    <section v-if="latestReport" class="featured container">
      <h2 class="section-heading">最新報告</h2>
      <RouterLink
        :to="{ name: 'report-viewer', params: { filename: latestReport.filename } }"
        class="featured-card"
      >
        <div class="featured-card__left">
          <span
            class="featured-card__category"
            :class="`featured-card__category--${latestReport.category}`"
          >
            {{ categoryLabels[latestReport.category] }}
          </span>
          <h3 class="featured-card__title">{{ latestReport.heading }}</h3>
          <p class="featured-card__badge">{{ latestReport.badge }}</p>
          <time class="featured-card__date">{{ formatDate(latestReport.date) }}</time>
        </div>
        <div class="featured-card__action">
          <span class="featured-card__arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            閱讀報告
          </span>
        </div>
      </RouterLink>
    </section>

    <!-- 所有報告區段 -->
    <section id="all-reports" class="all-reports container">
      <div class="section-heading-row">
        <h2 class="section-heading">所有報告</h2>
        <span class="section-heading__count">{{ filteredReports.length }} 篇</span>
      </div>

      <!-- 篩選工具列 -->
      <FilterBar
        v-model:category="selectedCategory"
        v-model:date="selectedDate"
        v-model:search="searchQuery"
        v-model:topic="selectedTopic"
        v-model:bookmarks-only="showBookmarksOnly"
        v-model:view-mode="viewMode"
        :available-dates="availableDates"
        :available-topics="availableTopics"
        :counts="reportStats"
      />

      <!-- Grid 檢視模式 -->
      <TransitionGroup
        v-if="viewMode === 'grid' && filteredReports.length"
        name="card-list"
        tag="div"
        class="report-list__grid"
      >
        <ReportCard
          v-for="(report, index) in filteredReports"
          :key="report.filename"
          :report="report"
          :style="{ transitionDelay: `${index * 50}ms` }"
          @select-topic="onSelectTopic"
        />
      </TransitionGroup>

      <!-- 時間軸檢視模式 -->
      <div v-else-if="viewMode === 'timeline' && timelineGroups.length" class="timeline">
        <div v-for="group in timelineGroups" :key="group.label" class="timeline__group">
          <h3 class="timeline__week-label">{{ group.label }}</h3>
          <div class="timeline__items">
            <RouterLink
              v-for="report in group.reports"
              :key="report.filename"
              :to="{ name: 'report-viewer', params: { filename: report.filename } }"
              class="timeline__item"
              :class="{ 'timeline__item--read': isRead(report.filename) }"
            >
              <span
                class="timeline__category"
                :class="`timeline__category--${report.category}`"
              >
                {{ categoryLabels[report.category] }}
              </span>
              <span class="timeline__title">{{ report.heading }}</span>
              <span class="timeline__topic">{{ report.topic }}</span>
              <time class="timeline__date">{{ formatDate(report.date) }}</time>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 空結果提示（含動畫與清除按鈕） -->
      <div v-else-if="!filteredReports.length" class="report-list__empty">
        <div class="report-list__empty-icon-wrap">
          <svg class="report-list__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p class="report-list__empty-title">沒有符合條件的報告</p>
        <p class="report-list__empty-hint">嘗試調整篩選條件或搜尋關鍵字</p>
        <button class="report-list__empty-clear btn-press" @click="clearFilters">
          清除所有篩選
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Hero 橫幅 ── */
.hero {
  background: linear-gradient(135deg, var(--color-navy-dark) 0%, var(--color-navy) 60%, var(--color-navy-light) 100%);
  color: var(--color-white);
  padding: 48px 0 40px;
  margin-top: -24px;
  margin-bottom: 32px;
  overflow: hidden;
}

.hero__inner {
  text-align: center;
}

.hero__title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 8px;
  animation: fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.hero__subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 28px;
  animation: fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both;
}

/* 統計數字列 */
.hero__stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  animation: fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  min-width: 80px;
  cursor: pointer;
  color: var(--color-white);
  border: 1px solid transparent;
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.hero-stat:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-stat--total {
  background: rgba(255, 255, 255, 0.18);
}

.hero-stat--tw {
  border-bottom: 2px solid var(--color-tag-tw);
}

.hero-stat--us {
  border-bottom: 2px solid var(--color-tag-us);
}

.hero-stat--sector {
  border-bottom: 2px solid var(--color-tag-sector);
}

.hero-stat__number {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-stat__label {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 2px;
}

.hero__latest {
  font-size: 13px;
  opacity: 0.6;
  animation: fadeIn 0.8s ease 0.5s both;
}

/* ── 區段標題 ── */
.section-heading {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.section-heading-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 0;
}

.section-heading-row .section-heading {
  margin-bottom: 0;
}

.section-heading__count {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 2px 10px;
  background: var(--color-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}


/* ── 最新報告精選 ── */
.featured {
  margin-bottom: 40px;
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
}

.featured-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-white);
  border-radius: var(--radius);
  padding: 28px 32px;
  box-shadow: 0 2px 8px var(--color-shadow);
  border-left: 4px solid var(--color-navy);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.3s ease,
              border-left-color 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.featured-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  border-left-color: var(--color-accent-blue);
}

.featured-card:active {
  transform: translateY(-1px) scale(0.995);
  transition-duration: 0.1s;
}

.featured-card__category {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.featured-card__category--tw {
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
}

.featured-card__category--us {
  color: var(--color-tag-us);
  background: var(--color-tag-us-bg);
}

.featured-card__category--sector {
  color: var(--color-tag-sector);
  background: var(--color-tag-sector-bg);
}

.featured-card__title {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 6px;
  color: var(--color-text);
}

.featured-card__badge {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.featured-card__date {
  font-size: 13px;
  color: var(--color-accent-muted);
}

.featured-card__action {
  flex-shrink: 0;
  margin-left: 24px;
}

.featured-card__arrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  white-space: nowrap;
  transition: gap 0.25s ease;
}

.featured-card__arrow svg {
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.featured-card:hover .featured-card__arrow svg {
  transform: translateX(4px);
}

/* ── 所有報告區段 ── */
.all-reports {
  padding-bottom: 48px;
  animation: fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.45s both;
}

.all-reports .section-heading-row {
  margin-bottom: 16px;
}

/* 卡片 Grid：桌面 3 欄 / 平板 2 欄 / 手機 1 欄 */
.report-list__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .report-list__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .report-list__grid {
    grid-template-columns: 1fr;
  }
}

/* 空結果提示 */
.report-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: var(--color-text-secondary);
  animation: fadeSlideUp 0.4s ease both;
}

.report-list__empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.report-list__empty-icon {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.report-list__empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.report-list__empty-hint {
  font-size: 14px;
  margin-bottom: 20px;
}

.report-list__empty-clear {
  padding: 8px 20px;
  min-height: var(--touch-min);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  background: var(--color-white);
  border: 1px solid var(--color-navy);
  transition: all 0.2s ease;
}

.report-list__empty-clear:hover {
  background: var(--color-navy);
  color: var(--color-white);
}

/* ── 時間軸檢視 ── */
.timeline__group {
  margin-bottom: 28px;
}

.timeline__week-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 8px 16px;
  background: var(--color-bg);
  border-radius: var(--radius);
  margin-bottom: 8px;
  border-left: 3px solid var(--color-navy);
}

.timeline__items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-white);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.timeline__item:hover {
  /* 深色模式 hover 背景由全域覆蓋規則處理（#1c2433） */
  background: #fafcff;
  border-color: var(--color-accent-blue);
  transform: translateX(4px);
}

.timeline__item--read {
  opacity: 0.7;
}

.timeline__category {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.timeline__category--tw {
  color: var(--color-tag-tw);
  background: var(--color-tag-tw-bg);
}

.timeline__category--us {
  color: var(--color-tag-us);
  background: var(--color-tag-us-bg);
}

.timeline__category--sector {
  color: var(--color-tag-sector);
  background: var(--color-tag-sector-bg);
}

.timeline__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline__topic {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  /* 淺色模式：深藍文字在淺灰背景，對比約 7:1；深色模式由全域覆蓋處理 */
  color: var(--color-navy);
  background: var(--color-bg);
  flex-shrink: 0;
}

.timeline__date {
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* ── RWD ── */
@media (max-width: 768px) {
  .hero {
    padding: 36px 0 28px;
  }

  .hero__title {
    font-size: 24px;
  }

  .hero__stats {
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-stat {
    padding: 10px 14px;
    min-width: 70px;
  }

  .hero-stat__number {
    font-size: 20px;
  }

  .featured-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .featured-card__title {
    font-size: 18px;
  }

  .featured-card__action {
    margin-left: 0;
    margin-top: 12px;
  }

  .timeline__item {
    flex-wrap: wrap;
    gap: 6px;
  }

  .timeline__title {
    width: 100%;
    order: 2;
  }

  .timeline__topic {
    order: 3;
  }

  .timeline__date {
    order: 1;
    margin-left: auto;
  }
}

/* 超小螢幕 */
@media (max-width: 480px) {
  .hero {
    padding: 28px 0 20px;
  }

  .hero__title {
    font-size: 20px;
  }

  .hero__subtitle {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .hero-stat {
    padding: 8px 12px;
    min-width: 60px;
  }

  .hero-stat__number {
    font-size: 18px;
  }

  .hero-stat__label {
    font-size: 12px;
  }

  .featured-card__title {
    font-size: 16px;
  }

  .section-heading {
    font-size: 18px;
  }
}
</style>
