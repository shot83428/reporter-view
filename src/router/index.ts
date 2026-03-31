import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 應用路由設定
 * 使用 hash mode 以支援靜態檔案部署，免後端設定
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'report-list',
      component: () => import('@/views/ReportList.vue'),
    },
    {
      path: '/report/:filename',
      name: 'report-viewer',
      component: () => import('@/views/ReportViewer.vue'),
      props: true,
    },
    {
      path: '/compare/:filename1/:filename2',
      name: 'report-compare',
      component: () => import('@/views/ReportCompare.vue'),
      props: true,
    },
  ],
})

export default router
