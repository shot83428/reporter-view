/**
 * 報告分類類型
 * tw: 台股相關, us: 美股相關, sector: 產業/跨市場分析
 */
export type ReportCategory = 'tw' | 'us' | 'sector'

/**
 * 市場分析報告的索引資訊，由建置時腳本從 HTML 報告中提取
 */
export interface ReportMeta {
  /** 檔名（不含副檔名），如 market-report-TWII-20260330 */
  filename: string
  /** 主題代碼，如 TWII, US-MARKET, GREEN-ENERGY */
  topic: string
  /** 報告日期，格式 YYYY-MM-DD */
  date: string
  /** 報告完整標題，取自 HTML <title> */
  title: string
  /** 資產類型標籤，取自 .asset-badge */
  badge: string
  /** 報告主標題，取自 .report-title */
  heading: string
  /** 分類：tw / us / sector */
  category: ReportCategory
  /** 報告摘要，取自報告首段文字（截取前 100 字） */
  summary: string
  /** 報告純文字內容（截取前 500 字），供全文搜尋使用 */
  content: string
}
