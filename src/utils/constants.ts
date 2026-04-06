/**
 * 翻譯插件的常數定義
 * 包含語言列表、翻譯工具清單和預設設定
 */

import type {
  LanguageSettings,
  PluginSettings,
  SourceLanguage,
  TranslationTool,
  TranslationToolId
} from "~src/types"

/** 目標翻譯語言（固定為繁體中文） */
export const TARGET_LANGUAGE = "zh-TW"

/** 所有支援的來源語言 */
export const SUPPORTED_LANGUAGES: {
  id: SourceLanguage
  name: string
}[] = [
  { id: "en", name: "英文" },
  { id: "ja", name: "日文" }
]

/** 所有可用的翻譯工具 */
export const ALL_TRANSLATION_TOOLS: TranslationTool[] = [
  {
    id: "cambridge",
    name: "劍橋詞典",
    supportedLanguages: ["en"]
  },
  {
    id: "google-translate",
    name: "Google 翻譯",
    supportedLanguages: ["en", "ja"]
  }
]

/**
 * 根據語言 ID 取得該語言支援的翻譯工具清單
 */
export function getToolsForLanguage(
  language: SourceLanguage
): TranslationTool[] {
  return ALL_TRANSLATION_TOOLS.filter((tool) =>
    tool.supportedLanguages.includes(language)
  )
}

/**
 * 根據工具 ID 取得工具名稱
 */
export function getToolName(toolId: TranslationToolId): string {
  const tool = ALL_TRANSLATION_TOOLS.find((t) => t.id === toolId)
  return tool?.name ?? toolId
}

/** 每種語言的預設設定（所有工具都在可選區，尚未選取） */
export const DEFAULT_LANGUAGE_SETTINGS: Record<
  SourceLanguage,
  LanguageSettings
> = {
  en: { selectedTools: [] },
  ja: { selectedTools: [] }
}

/** 插件的預設全域設定 */
export const DEFAULT_SETTINGS: PluginSettings = {
  currentLanguage: "en",
  languageConfigs: DEFAULT_LANGUAGE_SETTINGS
}

/** Drawer 固定尺寸（px） */
export const DRAWER_SIZE = 300

/** 自動儲存的延遲時間（毫秒） */
export const AUTO_SAVE_DELAY = 500

/** Storage 鍵名 */
export const STORAGE_KEY = "translate-plugin-settings"
