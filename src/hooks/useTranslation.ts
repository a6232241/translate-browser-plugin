/**
 * useTranslation Hook
 * 組合翻譯邏輯：讀取設定 → 取得已選工具 → 呼叫翻譯 → 回傳結果列表
 */

import { useCallback, useState } from "react"

import type {
  SourceLanguage,
  TranslationResult,
  TranslationToolId
} from "~src/types"
import { getToolName } from "~src/utils/constants"

interface UseTranslationReturn {
  /** 所有翻譯工具的結果列表 */
  results: TranslationResult[]
  /** 是否正在翻譯中 */
  isTranslating: boolean
  /** 執行翻譯（傳入文字、語言、已選工具清單） */
  translate: (
    text: string,
    language: SourceLanguage,
    tools: TranslationToolId[]
  ) => Promise<void>
  /** 清除目前的翻譯結果 */
  clearResults: () => void
}

export function useTranslation(): UseTranslationReturn {
  const [results, setResults] = useState<TranslationResult[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  /**
   * 執行翻譯
   * 並行呼叫所有已選工具的翻譯服務
   */
  const translate = useCallback(
    async (
      text: string,
      language: SourceLanguage,
      tools: TranslationToolId[]
    ) => {
      if (!text || tools.length === 0) return

      setIsTranslating(true)

      // 先設定所有工具為 loading 狀態
      const initialResults: TranslationResult[] = tools.map((toolId) => ({
        toolId,
        toolName: getToolName(toolId),
        result: "",
        isLoading: true
      }))
      setResults(initialResults)

      // 並行呼叫每個工具的翻譯
      const translationPromises = tools.map(async (toolId) => {
        try {
          // 透過 chrome.runtime.sendMessage 呼叫 Background SW
          const response = await chrome.runtime.sendMessage({
            type: "TRANSLATE",
            payload: { text, from: language, toolId }
          })

          return {
            toolId,
            toolName: getToolName(toolId),
            result: response?.result ?? "",
            isLoading: false,
            error: response?.error
          } as TranslationResult
        } catch (error) {
          return {
            toolId,
            toolName: getToolName(toolId),
            result: "",
            isLoading: false,
            error: `翻譯失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
          } as TranslationResult
        }
      })

      const completedResults = await Promise.all(translationPromises)

      // 依照原始工具順序排列結果
      const orderedResults = tools.map(
        (toolId) =>
          completedResults.find((r) => r.toolId === toolId) ??
          ({
            toolId,
            toolName: getToolName(toolId),
            result: "",
            isLoading: false,
            error: "翻譯失敗"
          } as TranslationResult)
      )

      setResults(orderedResults)
      setIsTranslating(false)
    },
    []
  )

  /** 清除翻譯結果 */
  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return { results, isTranslating, translate, clearResults }
}
