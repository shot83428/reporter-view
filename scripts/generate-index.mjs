/**
 * 報告索引產生器
 *
 * 掃描 daily-report/ 目錄中的 HTML 報告檔案，
 * 解析檔名、標題、badge 等資訊，輸出 src/data/report-index.json
 * 供前端應用載入使用。
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const REPORT_DIR = resolve(ROOT, 'daily-report')
const OUTPUT = resolve(ROOT, 'src/data/report-index.json')

// 檔名解析 regex：greedy match 主題（處理含連字號的主題如 US-MARKET、GREEN-ENERGY）
const FILENAME_RE = /^market-report-(.+)-(\d{8})\.html$/

/**
 * 分類邏輯：依主題名稱對應到 tw / us / sector
 * TWII, TAIEX, TW → 台股
 * US, US-MARKET, NKE, US10stocks → 美股
 * 其餘 → 產業分析
 */
const TW_TOPICS = new Set(['TWII', 'TAIEX', 'TW'])
const US_TOPICS = new Set(['US', 'US-MARKET', 'NKE', 'US10stocks'])

function categorize(topic) {
  if (TW_TOPICS.has(topic)) return 'tw'
  if (US_TOPICS.has(topic)) return 'us'
  return 'sector'
}

/**
 * 從 HTML 前 300 行提取 <title> 內容
 */
function extractTitle(lines) {
  for (const line of lines) {
    const m = line.match(/<title>(.+?)<\/title>/)
    if (m) return m[1].trim()
  }
  return ''
}

/**
 * 從 HTML 前 300 行提取 .asset-badge 內容
 * 處理 HTML entities（&middot; → ·）
 */
function extractBadge(lines) {
  for (const line of lines) {
    const m = line.match(/<div class="asset-badge">(.+?)<\/div>/)
    if (m) {
      return m[1]
        .replace(/&middot;/g, '·')
        .replace(/&amp;/g, '&')
        .trim()
    }
  }
  return ''
}

/**
 * 從 HTML 前 300 行提取 <h1> 內容（去除 span.ticker）
 */
function extractHeading(lines) {
  for (const line of lines) {
    const m = line.match(/<h1>(.+?)<\/h1>/)
    if (m) {
      return m[1]
        .replace(/<span[^>]*>.*?<\/span>/g, '')
        .replace(/&amp;/g, '&')
        .trim()
    }
  }
  return ''
}

/**
 * 去除 HTML 標籤，保留純文字
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 從 HTML 全文提取摘要（第一個 section-card 或第一段 <p> 的文字，截取前 100 字）
 */
function extractSummary(fullContent) {
  // 嘗試取第一個 .section-card 內的文字
  const sectionMatch = fullContent.match(/<div class="section-card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/)
  if (sectionMatch) {
    const text = stripHtml(sectionMatch[1])
    if (text.length > 10) return text.slice(0, 100)
  }

  // 回退：取第一個有實質內容的 <p> 標籤
  const paragraphs = fullContent.match(/<p[^>]*>(.+?)<\/p>/gs)
  if (paragraphs) {
    for (const p of paragraphs) {
      const text = stripHtml(p)
      if (text.length > 10) return text.slice(0, 100)
    }
  }

  return ''
}

/**
 * 從 HTML 全文提取純文字內容（去除標籤後截取前 500 字，供全文搜尋）
 */
function extractContent(fullContent) {
  // 只取 report-body 區塊的內容
  const bodyMatch = fullContent.match(/<div class="report-body"[^>]*>([\s\S]*?)$/)
  const target = bodyMatch ? bodyMatch[1] : fullContent
  const text = stripHtml(target)
  return text.slice(0, 500)
}

// 掃描 daily-report/ 目錄
const files = readdirSync(REPORT_DIR).filter((f) => FILENAME_RE.test(f)).sort()

const reports = files.map((filename) => {
  const match = filename.match(FILENAME_RE)
  const topic = match[1]
  const dateStr = match[2] // YYYYMMDD

  // 格式化日期為 YYYY-MM-DD
  const date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`

  // 讀取檔案全文，前 300 行用於提取 meta，全文用於摘要與搜尋內容
  const content = readFileSync(resolve(REPORT_DIR, filename), 'utf-8')
  const lines = content.split('\n').slice(0, 300)

  const title = extractTitle(lines)
  const badge = extractBadge(lines)
  const heading = extractHeading(lines)
  const category = categorize(topic)
  const summary = extractSummary(content)
  const contentText = extractContent(content)

  return {
    filename: filename.replace('.html', ''),
    topic,
    date,
    title,
    badge,
    heading,
    category,
    summary,
    content: contentText,
  }
})

// 確保輸出目錄存在並寫入 JSON
mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(reports, null, 2), 'utf-8')

console.log(`[generate-index] 已產生 ${reports.length} 筆報告索引 → src/data/report-index.json`)
