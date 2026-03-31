import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ReportMeta } from '@/types/report'

/**
 * 鍵盤快捷鍵 composable
 *
 * 列表頁：`/` 聚焦搜尋框
 * 檢視頁：`ArrowLeft` 上一篇、`ArrowRight` 下一篇、`Escape` 返回列表
 */

interface KeyboardOptions {
  /** 模式：列表頁或檢視頁 */
  mode: 'list' | 'viewer'
  /** 檢視頁模式下，取得上一篇報告的函式 */
  getPrev?: () => ReportMeta | undefined
  /** 檢視頁模式下，取得下一篇報告的函式 */
  getNext?: () => ReportMeta | undefined
  /** 列表頁模式下，搜尋框的 CSS 選擇器 */
  searchSelector?: string
}

export function useKeyboardShortcuts(options: KeyboardOptions) {
  const router = useRouter()

  function handleKeydown(e: KeyboardEvent) {
    // 忽略在 input/textarea/select 中的按鍵（除了 Escape）
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'

    if (options.mode === 'list') {
      // `/` 聚焦搜尋框
      if (e.key === '/' && !isInput) {
        e.preventDefault()
        const searchInput = document.querySelector(options.searchSelector || '.filter-bar__search-input') as HTMLInputElement
        searchInput?.focus()
      }
    }

    if (options.mode === 'viewer') {
      // Escape 返回列表
      if (e.key === 'Escape') {
        e.preventDefault()
        router.push({ name: 'report-list' })
        return
      }

      // 在 input 中不處理方向鍵
      if (isInput) return

      // ArrowLeft 上一篇
      if (e.key === 'ArrowLeft' && options.getPrev) {
        const prev = options.getPrev()
        if (prev) {
          e.preventDefault()
          router.push({ name: 'report-viewer', params: { filename: prev.filename } })
        }
      }

      // ArrowRight 下一篇
      if (e.key === 'ArrowRight' && options.getNext) {
        const next = options.getNext()
        if (next) {
          e.preventDefault()
          router.push({ name: 'report-viewer', params: { filename: next.filename } })
        }
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
