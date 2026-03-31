import { reactive } from 'vue'

/**
 * 報告已讀狀態管理 composable
 * 使用 localStorage 持久化已讀記錄，提供標記已讀與查詢已讀狀態的功能。
 * localStorage key 為 `read-reports`，值為已讀 filename 的 JSON array。
 */

/** localStorage 儲存鍵名 */
const STORAGE_KEY = 'read-reports'

/**
 * 從 localStorage 讀取已讀報告清單
 * @returns 已讀報告 filename 的 Set
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
 * 將已讀 Set 寫入 localStorage
 * @param set - 已讀報告 filename 的 Set
 */
function saveToStorage(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage 寫入失敗時靜默處理（例如 storage 已滿）
  }
}

/** 全域共用的已讀報告 reactive Set，從 localStorage 初始化 */
const readSet = reactive(loadFromStorage())

/**
 * 報告已讀狀態管理
 * 提供標記已讀、查詢已讀狀態、以及已讀集合的 reactive 引用。
 *
 * @example
 * ```ts
 * const { markAsRead, isRead } = useReadHistory()
 * markAsRead('market-report-TWII-20260330')
 * console.log(isRead('market-report-TWII-20260330')) // true
 * ```
 */
export function useReadHistory() {
  /**
   * 將指定報告標記為已讀，同時更新 reactive Set 與 localStorage
   * @param filename - 報告檔名（不含副檔名）
   */
  function markAsRead(filename: string): void {
    if (!readSet.has(filename)) {
      readSet.add(filename)
      saveToStorage(readSet)
    }
  }

  /**
   * 查詢指定報告是否已讀
   * @param filename - 報告檔名（不含副檔名）
   * @returns 是否已讀
   */
  function isRead(filename: string): boolean {
    return readSet.has(filename)
  }

  return {
    /** 已讀報告 filename 的 reactive Set */
    readSet,
    markAsRead,
    isRead,
  }
}
