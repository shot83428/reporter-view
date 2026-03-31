<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()

/** 報告檢視頁需要 iframe 全高顯示，不加 padding */
const isViewerPage = computed(() => route.name === 'report-viewer')
</script>

<template>
  <!-- 應用外殼：頂部導覽列 + 路由內容區（含路由轉場動畫） -->
  <AppHeader />
  <main class="app-main" :class="{ 'app-main--viewer': isViewerPage }">
    <RouterView v-slot="{ Component }">
      <Transition name="route-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.app-main {
  flex: 1;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
}

/* 報告檢視頁：去掉 padding，讓 iframe 佔滿 */
.app-main--viewer {
  padding: 0;
}
</style>
