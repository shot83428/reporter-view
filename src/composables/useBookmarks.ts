import { reactive } from 'vue'

/**
 * 報告收藏管理 composable
 * 使用 localStorage 持久化收藏記錄，提供切換收藏與查詢收藏狀態的功能。
 * localStorage key 為 `bookmarked-reports`，值為已收藏 filename 的 JSON array。
 */

/** localStorage 儲存鍵名 */
const STORAGE_KEY = 'bookmarked-reports'

/**
 * 從 localStorage 讀取收藏報告清單
 * @returns 收藏報告 filename 的 Set
 */
function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr: unknown = JSON.parse(raw)
      if (Array.isArray(arr)) {
        return new Set(arr.filter((item): item is string => typeof item === 'string'))
      }
    }
  } catch {
    // localStorage 讀取或 JSON 解析失敗時，回傳空 Set
  }
  return new Set()
}

/**
 * 將收藏 Set 寫入 localStorage
 * @param set - 收藏報告 filename 的 Set
 */
function saveToStorage(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage 寫入失敗時靜默處理
  }
}

/** 全域共用的收藏報告 reactive Set，從 localStorage 初始化 */
const bookmarkSet = reactive(loadFromStorage())

/**
 * 報告收藏管理
 * 提供切換收藏、查詢收藏狀態、以及收藏集合的 reactive 引用。
 */
export function useBookmarks() {
  /**
   * 切換指定報告的收藏狀態
   * @param filename - 報告檔名（不含副檔名）
   */
  function toggleBookmark(filename: string): void {
    if (bookmarkSet.has(filename)) {
      bookmarkSet.delete(filename)
    } else {
      bookmarkSet.add(filename)
    }
    saveToStorage(bookmarkSet)
  }

  /**
   * 查詢指定報告是否已收藏
   * @param filename - 報告檔名（不含副檔名）
   * @returns 是否已收藏
   */
  function isBookmarked(filename: string): boolean {
    return bookmarkSet.has(filename)
  }

  return {
    /** 收藏報告 filename 的 reactive Set */
    bookmarkSet,
    toggleBookmark,
    isBookmarked,
  }
}
