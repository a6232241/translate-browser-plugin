/**
 * useTextSelection Hook
 * 偵測使用者在網頁上選取的文字，並提供 Range 物件供 highlight 使用
 */

import { useCallback, useEffect, useRef, useState } from "react"

interface UseTextSelectionReturn {
  /** 使用者選取的文字 */
  selectedText: string
  /** 選取區域的邊界 */
  selectionRect: DOMRect | null
  /**
   * 對目前選取的文字套用黃色 highlight 效果。
   * 會將選取範圍包裹在 <mark> 元素中，呼叫後不影響已存在的 highlight。
   */
  applyHighlight: () => void
  /** 清除目前的選取文字（不移除已套用的 highlight） */
  clearSelection: () => void
}

export function useTextSelection(): UseTextSelectionReturn {
  const [selectedText, setSelectedText] = useState("")
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null)

  /**
   * 保存最新選取的 Range，用於之後套用 highlight。
   * 使用 ref 避免觸發不必要的重新渲染。
   */
  const selectionRangeRef = useRef<Range | null>(null)

  /** 處理滑鼠放開事件以擷取選取文字與 Range */
  const handleMouseUp = useCallback(() => {
    // 延遲執行以確保瀏覽器已完成選取
    setTimeout(() => {
      const selection = document.getSelection()
      const text = selection?.toString().trim() ?? ""

      if (text && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        // 複製 Range 以免瀏覽器清除選取時參考失效
        selectionRangeRef.current = range.cloneRange()
        setSelectionRect(range.getBoundingClientRect())
        setSelectedText(text)
      } else {
        selectionRangeRef.current = null
        setSelectionRect(null)
        setSelectedText("")
      }
    }, 10)
  }, [])

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseUp])

  /**
   * 建立帶有黃色螢光筆樣式的 <mark> 元素。
   * 使用 inline style 確保樣式不受宿主頁面 CSS 干擾。
   */
  const createHighlightMark = (): HTMLElement => {
    const mark = document.createElement("mark")
    // 套用無法被宿主頁面覆蓋的 inline 螢光筆樣式
    mark.style.cssText = [
      "background-color: #FFE066",
      "color: inherit",
      "border-radius: 2px",
      "padding: 0 1px",
      "box-shadow: 0 1px 3px rgba(255, 200, 0, 0.4)",
      "transition: background-color 0.2s ease"
    ].join("; ")
    mark.setAttribute("data-translate-plugin-highlight", "true")
    return mark
  }

  /**
   * 對目前儲存的 Range 套用黃色 highlight。
   * 以 <mark> 元素包裹選取範圍；若 Range 跨越多個父節點，
   * 則回退為 extractContents + insertNode 以避免 DOM 結構錯誤。
   */
  const applyHighlight = useCallback(() => {
    const range = selectionRangeRef.current
    if (!range) return

    try {
      // 嘗試直接包裹（選取範圍在單一元素內時有效）
      range.surroundContents(createHighlightMark())
    } catch {
      // 當選取跨越多個父節點時，改用 extractContents + insertNode
      try {
        const mark = createHighlightMark()
        mark.appendChild(range.extractContents())
        range.insertNode(mark)
      } catch {
        // 無法套用 highlight（例如在 input / textarea 等不支援的元素上）
      }
    }

    // 清除瀏覽器視覺選取，但保留 highlight
    document.getSelection()?.removeAllRanges()
    selectionRangeRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedText("")
    setSelectionRect(null)
    selectionRangeRef.current = null
  }, [])

  return { selectedText, selectionRect, applyHighlight, clearSelection }
}

