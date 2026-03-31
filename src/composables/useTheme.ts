import { ref, watchEffect } from 'vue'

/**
 * 深色模式管理 composable
 * 使用 localStorage 持久化主題偏好，透過 html[data-theme] 切換 CSS 變數。
 */

/** localStorage 儲存鍵名 */
const STORAGE_KEY = 'theme-preference'

type Theme = 'light' | 'dark'

/**
 * 從 localStorage 讀取主題偏好，若無則使用系統偏好
 */
function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage 讀取失敗
  }
  // 回退到系統偏好
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/** 目前主題，全域共用 */
const theme = ref<Theme>(loadTheme())

/** 是否為深色模式 */
const isDark = ref(theme.value === 'dark')

// 監聽主題變化，同步 DOM attribute 與 localStorage
watchEffect(() => {
  isDark.value = theme.value === 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {
    // localStorage 寫入失敗時靜默處理
  }
})

/**
 * 主題切換管理
 * 提供深色/淺色模式切換功能。
 */
export function useTheme() {
  /** 切換深色/淺色模式 */
  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    /** 是否為深色模式 */
    isDark,
    toggleTheme,
  }
}
