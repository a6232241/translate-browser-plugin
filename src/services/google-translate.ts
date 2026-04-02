/**
 * Google 翻譯服務
 * 透過抓取 Google 翻譯網頁 API 來取得翻譯結果
 */

import type { SourceLanguage } from "~src/types"

/** Google 翻譯的語言代碼對應 */
const LANGUAGE_MAP: Record<SourceLanguage, string> = {
  en: "en",
  ja: "ja"
}

/**
 * 使用 Google 翻譯取得翻譯結果
 * 使用公開的 translate API endpoint
 *
 * @param text - 要翻譯的文字
 * @param from - 來源語言
 * @returns 繁體中文翻譯結果
 */
export async function translateWithGoogle(
  text: string,
  from: SourceLanguage
): Promise<string> {
  const sourceLang = LANGUAGE_MAP[from]
  const targetLang = "zh-TW"
  const encodedText = encodeURIComponent(text)

  // 使用 Google 翻譯的公開 API endpoint
  const url =
    `https://translate.googleapis.com/translate_a/single?` +
    `client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return parseGoogleResponse(data)
  } catch (error) {
    throw new Error(
      `Google 翻譯失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
    )
  }
}

/**
 * 解析 Google 翻譯 API 回應
 * 回應格式為巢狀陣列，翻譯文字在 [0][i][0]
 */
function parseGoogleResponse(data: unknown): string {
  try {
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("無效的回應格式")
    }

    // 組合所有翻譯片段
    const translatedParts: string[] = []
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === "string") {
        translatedParts.push(segment[0])
      }
    }

    const result = translatedParts.join("")
    if (!result) {
      throw new Error("翻譯結果為空")
    }

    return result
  } catch {
    return "無法解析翻譯結果"
  }
}
