/**
 * 劍橋詞典翻譯服務
 * 透過抓取劍橋詞典網頁來取得英文到繁體中文的翻譯結果
 */

/**
 * 從劍橋詞典抓取翻譯結果
 * @param text - 要翻譯的英文單字或短語
 * @returns 繁體中文翻譯結果
 */
export async function translateWithCambridge(
  text: string
): Promise<string> {
  const encodedText = encodeURIComponent(text.toLowerCase().trim())
  const url = `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodedText}`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8"
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    return parseCambridgeHtml(html)
  } catch (error) {
    throw new Error(
      `劍橋詞典查詢失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
    )
  }
}

/**
 * 解析劍橋詞典 HTML 頁面，擷取翻譯定義
 */
function parseCambridgeHtml(html: string): string {
  const results: string[] = []

  // 擷取中文定義（trans dtrans dtrans-se 類別）
  const transRegex =
    /<span class="trans dtrans dtrans-se[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
  let match: RegExpExecArray | null

  while ((match = transRegex.exec(html)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, "") // 移除 HTML 標籤
      .replace(/&[^;]+;/g, " ") // 移除 HTML entities
      .trim()

    if (text && !results.includes(text)) {
      results.push(text)
    }

    // 最多取 5 個定義
    if (results.length >= 5) break
  }

  if (results.length === 0) {
    // 嘗試備用解析：擷取 def-body 中的內容
    const defRegex =
      /<div class="def-body[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    while ((match = defRegex.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, "").trim()
      if (text && !results.includes(text)) {
        results.push(text)
      }
      if (results.length >= 3) break
    }
  }

  if (results.length === 0) {
    return "找不到此單字的翻譯"
  }

  return results.map((r, i) => `${i + 1}. ${r}`).join("\n")
}
