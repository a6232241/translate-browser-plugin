/**
 * useTextSelection Hook
 * 偵測使用者在網頁上選取的文字
 */

import { useCallback, useEffect, useState } from "react"

interface UseTextSelectionReturn {
  /** 使用者選取的文字 */
  selectedText: string
  /** 清除目前的選取文字 */
  clearSelection: () => void
}

export function useTextSelection(): UseTextSelectionReturn {
  const [selectedText, setSelectedText] = useState("")

  /** 處理滑鼠放開事件以擷取選取文字 */
  const handleMouseUp = useCallback(() => {
    // 延遲執行以確保瀏覽器已完成選取
    setTimeout(() => {
      const selection = document.getSelection()
      const text = selection?.toString().trim() ?? ""
      setSelectedText(text)
    }, 10)
  }, [])

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseUp])

  const clearSelection = useCallback(() => {
    setSelectedText("")
  }, [])

  return { selectedText, clearSelection }
}
