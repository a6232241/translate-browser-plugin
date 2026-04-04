/**
 * 翻譯插件的全域型別定義
 */

/** 支援的來源語言 */
export type SourceLanguage = "en" | "ja"

/** 翻譯工具 ID */
export type TranslationToolId = "cambridge" | "google-translate"

/** 翻譯工具的完整資訊 */
export interface TranslationTool {
  /** 工具唯一識別碼 */
  id: TranslationToolId
  /** 工具顯示名稱 */
  name: string
  /** 支援的來源語言清單 */
  supportedLanguages: SourceLanguage[]
}

/** 單一語言的設定內容 */
export interface LanguageSettings {
  /** 已選取且已排序的翻譯工具列表 */
  selectedTools: TranslationToolId[]
}

/** 全域插件設定（儲存在 chrome.storage.sync） */
export interface PluginSettings {
  /** 當前選擇的來源語言 */
  currentLanguage: SourceLanguage
  /** 每種語言分別的翻譯工具設定 */
  languageConfigs: Record<SourceLanguage, LanguageSettings>
}

/**
 * 豐富的翻譯結果結構 (例如：劍橋詞典)
 */
export interface RichTranslation {
  /** 詞性 (e.g. noun, verb, adjective) */
  pos?: string
  /** 發音資訊 (UK/US) */
  pronunciations?: Array<{
    type: "UK" | "US"
    ipa: string
    audioUrl?: string
  }>
  /** 定義內容 */
  definitions: Array<{
    /** 英文定義描述 */
    englishDefinition?: string
    /** 中文翻譯 */
    chineseTranslation: string
  }>
  /** 例句清單 */
  examples?: Array<{
    /** 英文例句 */
    original: string
    /** 中文翻譯 */
    translation?: string
  }>
  /** 如果抓取失敗，提供 iframe 嵌入的 URL */
  iframeUrl?: string
}

/** 單一翻譯工具的翻譯結果 */
export interface TranslationResult {
  /** 工具 ID */
  toolId: TranslationToolId
  /** 工具顯示名稱 */
  toolName: string
  /** 翻譯結果（可以是純文字或結構化資料） */
  result: string | RichTranslation
  /** 是否正在載入翻譯 */
  isLoading: boolean
  /** 錯誤訊息（若有） */
  error?: string
}

/** Drawer 的顯示方向 */
export type DrawerPosition = "right" | "bottom"

/** 翻譯請求（傳給 Background SW） */
export interface TranslateRequest {
  /** 要翻譯的文字 */
  text: string
  /** 來源語言 */
  from: SourceLanguage
  /** 使用的翻譯工具 ID */
  toolId: TranslationToolId
}

/** 翻譯回應（從 Background SW 回傳） */
export interface TranslateResponse {
  /** 翻譯結果 */
  result?: string | RichTranslation
  /** 錯誤訊息 */
  error?: string
}
