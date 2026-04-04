import type { RichTranslation } from "~src/types"

const BASE_URL = "https://dictionary.cambridge.org"

/**
 * 從劍橋詞典抓取翻譯結果
 * @param text - 要翻譯的英文單字或短語
 * @returns 繁體中文翻譯結果或結構化 RichTranslation
 */
export async function translateWithCambridge(
  text: string
): Promise<string | RichTranslation> {
  const encodedText = encodeURIComponent(text.toLowerCase().trim())
  const searchUrl = `${BASE_URL}/dictionary/english-chinese-traditional/${encodedText}`

  try {
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        // 模仿使用者提供的 Edge 146 User-Agent
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "Referer": "https://dictionary.cambridge.org/zht/",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1"
      }
    })

    if (!response.ok) {
      if (response.status === 403) {
        // 當遇到 403 時，回傳 iframeUrl 讓前端顯示官網介面
        return { 
          definitions: [], 
          iframeUrl: searchUrl 
        } as RichTranslation
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    
    // 如果返回的 HTML 包含 Cloudflare 的挑戰頁面
    if (html.includes("cf-browser-verification") || html.includes("Checking your browser")) {
      return { 
        definitions: [], 
        iframeUrl: searchUrl 
      } as RichTranslation
    }

    return parseCambridgeHtml(html)
  } catch (error) {
    throw new Error(
      `劍橋詞典查詢失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
    )
  }
}

/**
 * 解析劍橋詞典 HTML 頁面，擷取定義、發音與例句
 */
function parseCambridgeHtml(html: string): string | RichTranslation {
  // 移除換行與多餘空格以方便正則匹配
  const cleanHtml = html.replace(/\s+/g, " ")

  const result: RichTranslation = {
    definitions: [],
    pronunciations: [],
    examples: []
  }

  // 1. 擷取詞性 (POS)
  const posMatch = cleanHtml.match(/<span class="pos dpos"[^>]*>([\s\S]*?)<\/span>/i)
  if (posMatch) {
    result.pos = posMatch[1].trim()
  }

  // 2. 擷取發音 (UK)
  const ukIpaMatch = cleanHtml.match(/<span class="uk dpron-i "[^>]*>[\s\S]*?<span class="ipa dipa lpr-2 lpl-1">([\s\S]*?)<\/span>[\s\S]*?<source type="audio\/mpeg" src="([\s\S]*?)"/i)
  if (ukIpaMatch) {
    result.pronunciations?.push({
      type: "UK",
      ipa: ukIpaMatch[1],
      audioUrl: ukIpaMatch[2].startsWith("http") ? ukIpaMatch[2] : BASE_URL + ukIpaMatch[2]
    })
  }

  // 3. 擷取發音 (US)
  const usIpaMatch = cleanHtml.match(/<span class="us dpron-i "[^>]*>[\s\S]*?<span class="ipa dipa lpr-2 lpl-1">([\s\S]*?)<\/span>[\s\S]*?<source type="audio\/mpeg" src="([\s\S]*?)"/i)
  if (usIpaMatch) {
    result.pronunciations?.push({
      type: "US",
      ipa: usIpaMatch[1],
      audioUrl: usIpaMatch[2].startsWith("http") ? usIpaMatch[2] : BASE_URL + usIpaMatch[2]
    })
  }

  // 4. 擷取定義與翻譯
  const senseRegex = /<div class="def-block ddef_block "[^>]*>([\s\S]*?)<\/div> <\/div>/gi
  let match: RegExpExecArray | null

  while ((match = senseRegex.exec(cleanHtml)) !== null && result.definitions.length < 5) {
    const block = match[1]
    const defMatch = block.match(/<div class="def ddef_d db"[^>]*>([\s\S]*?)<\/div>/i)
    const transMatch = block.match(/<span class="trans dtrans dtrans-se[^"]*"[^>]*>([\s\S]*?)<\/span>/i)

    if (transMatch) {
      result.definitions.push({
        englishDefinition: defMatch ? defMatch[1].replace(/<[^>]+>/g, "").trim() : undefined,
        chineseTranslation: transMatch[1].replace(/<[^>]+>/g, "").trim()
      })

      // 5. 在此定義區塊內擷取例句
      const exRegex = /<div class="examp dexamp"[^>]*>([\s\S]*?)<\/div> <\/div>/gi
      let exMatch: RegExpExecArray | null
      while ((exMatch = exRegex.exec(block)) !== null && (result.examples?.length ?? 0) < 5) {
        const exBlock = exMatch[1]
        const egMatch = exBlock.match(/<span class="eg deg"[^>]*>([\s\S]*?)<\/span>/i)
        const trMatch = exBlock.match(/<span class="trans dtrans dtrans-se[^"]*"[^>]*>([\s\S]*?)<\/span>/i)

        if (egMatch) {
          result.examples?.push({
            original: egMatch[1].replace(/<[^>]+>/g, "").trim(),
            translation: trMatch ? trMatch[1].replace(/<[^>]+>/g, "").trim() : undefined
          })
        }
      }
    }
  }

  // 驗證是否有任何有效的返回資料（詞性、音標或定義）
  const hasData =
    result.pos ||
    (result.pronunciations && result.pronunciations.length > 0) ||
    result.definitions.length > 0

  if (!hasData) {
    // 最後嘗試：如果沒抓到結構化資料，看能不能抓到單純的翻譯文字作為備援
    const simpleTransMatch = cleanHtml.match(/<span class="trans dtrans dtrans-se[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
    if (simpleTransMatch) {
      return simpleTransMatch[1].replace(/<[^>]+>/g, "").trim()
    }
    return "找不到此單字的翻譯資料"
  }

  return result
}
