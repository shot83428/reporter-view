import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { cpSync } from 'fs'
import { execSync } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  base: '/reporter-view/',
  plugins: [
    vue(),
    {
      name: 'copy-daily-report',
      closeBundle() {
        // 建置完成後將 daily-report/ 複製到 dist/daily-report/
        cpSync(
          resolve(__dirname, 'daily-report'),
          resolve(__dirname, 'dist/daily-report'),
          { recursive: true }
        )
      }
    },
    {
      name: 'watch-daily-report',
      configureServer(server) {
        // 開發模式下監聽 daily-report/ 目錄，新增或刪除 HTML 時自動重新產生索引
        const reportDir = resolve(__dirname, 'daily-report')
        server.watcher.add(reportDir)
        server.watcher.on('all', (event, filePath) => {
          if (!filePath.startsWith(reportDir) || !filePath.endsWith('.html')) return
          if (event !== 'add' && event !== 'unlink') return
          console.log(`[watch-daily-report] 偵測到報告${event === 'add' ? '新增' : '刪除'}，重新產生索引...`)
          execSync('node scripts/generate-index.mjs', { cwd: __dirname, stdio: 'inherit' })
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
