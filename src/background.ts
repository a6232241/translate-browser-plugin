/**
 * Background Service Worker
 * 處理來自 Content Script 的翻譯請求
 * 在 Background SW 中執行 HTTP 請求以迴避 CORS 限制
 */

import type { TranslateRequest, TranslateResponse } from "~src/types"
import { translateText } from "~src/services/translator-factory"

/**
 * 初始化：移除 X-Frame-Options 等標頭，允許 cambridge.org 在 iframe 顯示
 */
async function setupIframeRules() {
  const ruleId = 1
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
      addRules: [
        {
          id: ruleId,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
              {
                header: "X-Frame-Options",
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE
              },
              {
                header: "Content-Security-Policy",
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE
              }
            ]
          },
          condition: {
            urlFilter: "*://*.cambridge.org/*",
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME]
          }
        }
      ]
    })
    console.log("Iframe rules updated successfully.")
  } catch (error) {
    console.error("Failed to update iframe rules:", error)
  }
}

// 啟動時註冊規則
chrome.runtime.onInstalled.addListener(setupIframeRules)
chrome.runtime.onStartup.addListener(setupIframeRules)

/**
 * 監聽來自 Content Script 的訊息
 * 訊息格式：{ type: "TRANSLATE", payload: TranslateRequest }
 */
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload: TranslateRequest },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: TranslateResponse) => void
  ) => {
    if (message.type === "TRANSLATE") {
      handleTranslateRequest(message.payload)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            error:
              error instanceof Error ? error.message : "翻譯過程中發生未知錯誤"
          })
        })

      // 回傳 true 表示會以非同步方式呼叫 sendResponse
      return true
    }
  }
)

/**
 * 處理翻譯請求
 */
async function handleTranslateRequest(
  request: TranslateRequest
): Promise<TranslateResponse> {
  try {
    const result = await translateText(
      request.toolId,
      request.text,
      request.from
    )
    return { result }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "翻譯過程中發生未知錯誤"
    }
  }
}
