<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <!-- 頂部導覽列，深藍漸層背景，與報告 header 風格一致 -->
  <header class="app-header">
    <div class="app-header__inner container">
      <RouterLink to="/" class="app-header__brand">
        <svg class="app-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span class="app-header__title">市場分析報告</span>
      </RouterLink>

      <!-- 深色模式切換按鈕 -->
      <button class="app-header__theme-btn btn-press" @click="toggleTheme" :title="isDark ? '切換為淺色模式' : '切換為深色模式'">
        <!-- 太陽 icon（深色模式時顯示） -->
        <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <!-- 月亮 icon（淺色模式時顯示） -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  background: linear-gradient(135deg, var(--color-navy-dark) 0%, var(--color-navy) 60%, var(--color-navy-light) 100%);
  color: var(--color-white);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-white);
  transition: opacity var(--transition);
}

.app-header__brand:hover {
  opacity: 0.85;
}

.app-header__icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.app-header__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 深色模式切換按鈕 */
.app-header__theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--color-white);
  background: rgba(255, 255, 255, 0.12);
  transition: background 0.2s ease;
}

.app-header__theme-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
