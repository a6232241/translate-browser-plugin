/**
 * 翻譯工具工廠
 * 根據工具 ID 分派到對應的翻譯服務
 */

import type { SourceLanguage, TranslationToolId } from "~src/types"

import { translateWithCambridge } from "./cambridge"
import { translateWithGoogle } from "./google-translate"

/**
 * 翻譯工廠函式
 * 依據工具 ID 呼叫對應的翻譯服務
 *
 * @param toolId - 翻譯工具 ID
 * @param text - 要翻譯的文字
 * @param from - 來源語言
 * @returns 翻譯結果文字
 */
export async function translateText(
  toolId: TranslationToolId,
  text: string,
  from: SourceLanguage
): Promise<string> {
  switch (toolId) {
    case "cambridge":
      return translateWithCambridge(text)

    case "google-translate":
      return translateWithGoogle(text, from)

    default:
      throw new Error(`不支援的翻譯工具: ${toolId}`)
  }
}
