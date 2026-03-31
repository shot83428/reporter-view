import { ref, computed } from 'vue'
import type { ReportMeta, ReportCategory } from '@/types/report'
import { useBookmarks } from '@/composables/useBookmarks'
import reportIndex from '@/data/report-index.json'

/**
 * 報告時間軸分組項目
 */
export interface TimelineGroup {
  /** 週標題，如「2026/03/24 – 03/30」 */
  label: string
  /** 該週的報告清單 */
  reports: ReportMeta[]
}

/**
 * 報告篩選與查詢 composable
 * 載入建置時產生的報告索引，提供分類、日期、主題、收藏、全文搜尋篩選功能
 */
export function useReports() {
  const { isBookmarked } = useBookmarks()

  /** 所有報告（依日期降序） */
  const allReports: ReportMeta[] = (reportIndex as ReportMeta[])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))

  /** 目前選取的分類篩選，null 表示全部 */
  const selectedCategory = ref<ReportCategory | null>(null)

  /** 目前選取的日期篩選，null 表示全部 */
  const selectedDate = ref<string | null>(null)

  /** 搜尋關鍵字 */
  const searchQuery = ref('')

  /** 目前選取的主題篩選，null 表示全部 */
  const selectedTopic = ref<string | null>(null)

  /** 是否僅顯示收藏報告 */
  const showBookmarksOnly = ref(false)

  /** 檢視模式：grid 或 timeline */
  const viewMode = ref<'grid' | 'timeline'>('grid')

  /** 可用的日期清單（降序，不重複） */
  const availableDates = computed<string[]>(() => {
    const dates = new Set(allReports.map((r) => r.date))
    return [...dates].sort((a, b) => b.localeCompare(a))
  })

  /** 可用的主題清單（依字母排序） */
  const availableTopics = computed<string[]>(() => {
    const topics = new Set(allReports.map((r) => r.topic))
    return [...topics].sort()
  })

  /** 篩選後的報告清單 */
  const filteredReports = computed<ReportMeta[]>(() => {
    let result = allReports

    // 依分類篩選
    if (selectedCategory.value) {
      result = result.filter((r) => r.category === selectedCategory.value)
    }

    // 依日期篩選
    if (selectedDate.value) {
      result = result.filter((r) => r.date === selectedDate.value)
    }

    // 依主題篩選
    if (selectedTopic.value) {
      result = result.filter((r) => r.topic === selectedTopic.value)
    }

    // 僅顯示收藏
    if (showBookmarksOnly.value) {
      result = result.filter((r) => isBookmarked(r.filename))
    }

    // 依關鍵字搜尋（標題、主題、badge、heading + 全文內容）
    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.topic.toLowerCase().includes(query) ||
          r.badge.toLowerCase().includes(query) ||
          r.heading.toLowerCase().includes(query) ||
          (r.content && r.content.toLowerCase().includes(query)),
      )
    }

    return result
  })

  /**
   * 將篩選後的報告按週分組（時間軸檢視用）
   * 以每週一為起始日，報告依日期降序排列
   */
  const timelineGroups = computed<TimelineGroup[]>(() => {
    const groups = new Map<string, ReportMeta[]>()

    for (const report of filteredReports.value) {
      const d = new Date(report.date + 'T00:00:00')
      // 取得該週的週一日期
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d)
      monday.setDate(diff)

      const key = monday.toISOString().slice(0, 10)

      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(report)
    }

    // 依週起始日降序排列
    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, reports]) => {
        const d = new Date(reports[0].date + 'T00:00:00')
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d)
        monday.setDate(diff)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)

        const label = `${monday.getFullYear()}/${String(monday.getMonth() + 1).padStart(2, '0')}/${String(monday.getDate()).padStart(2, '0')} – ${String(sunday.getMonth() + 1).padStart(2, '0')}/${String(sunday.getDate()).padStart(2, '0')}`

        return { label, reports }
      })
  })

  /** 報告統計數據（各分類篇數、最新報告日期） */
  const reportStats = computed(() => {
    const tw = allReports.filter((r) => r.category === 'tw').length
    const us = allReports.filter((r) => r.category === 'us').length
    const sector = allReports.filter((r) => r.category === 'sector').length
    const latestDate = allReports.length > 0 ? allReports[0].date : ''
    return { total: allReports.length, tw, us, sector, latestDate }
  })

  /** 最新一篇報告 */
  const latestReport = computed<ReportMeta | undefined>(() => allReports[0])

  /** 依檔名查找單一報告 */
  function getReport(filename: string): ReportMeta | undefined {
    return allReports.find((r) => r.filename === filename)
  }

  /**
   * 取得指定報告的前後篇（依日期降序排列）
   * prev = 列表中較舊的一篇（index + 1），next = 較新的一篇（index - 1）
   *
   * @param filename 當前報告檔名（不含副檔名）
   * @returns 前一篇與下一篇的 ReportMeta，若無則為 undefined
   */
  function getAdjacentReports(filename: string): {
    prev: ReportMeta | undefined
    next: ReportMeta | undefined
  } {
    const index = allReports.findIndex((r) => r.filename === filename)
    if (index === -1) return { prev: undefined, next: undefined }
    return {
      prev: index < allReports.length - 1 ? allReports[index + 1] : undefined,
      next: index > 0 ? allReports[index - 1] : undefined,
    }
  }

  /**
   * 取得同主題的所有報告（用於比較模式選單）
   * @param topic 主題代碼
   * @param excludeFilename 要排除的檔名（當前報告）
   */
  function getSameTopicReports(topic: string, excludeFilename?: string): ReportMeta[] {
    return allReports.filter(
      (r) => r.topic === topic && r.filename !== excludeFilename,
    )
  }

  return {
    allReports,
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
    getReport,
    getAdjacentReports,
    getSameTopicReports,
  }
}
