import cssText from "data-text:~styles/globals.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import BlueDot from "~src/components/BlueDot"
import Drawer from "~src/components/Drawer"
import { useDrawerPosition } from "~src/hooks/useDrawerPosition"
import { useSettings } from "~src/hooks/useSettings"
import { useTextSelection } from "~src/hooks/useTextSelection"
import { useTranslation } from "~src/hooks/useTranslation"
import { DRAWER_SIZE } from "~src/utils/constants"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

/** Content Script 設定 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const TranslatorUI: React.FC = () => {
  // 1. 採用封裝好的 Hooks
  const { settings } = useSettings()
  const { selectedText, selectionRect, clearSelection } = useTextSelection()
  const { results, translate, clearResults } = useTranslation()

  // 2. 面板位置：使用持久化 hook，預設右側
  const { drawerPosition, setDrawerPosition } = useDrawerPosition()

  // 3. 本地 UI 狀態
  const [dotVisible, setDotVisible] = useState(false)
  const [dotPosition, setDotPosition] = useState({ top: 0, left: 0 })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeText, setActiveText] = useState("")
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  /** 偵測捲軸寬度以避免位移 */
  useEffect(() => {
    if (isDrawerOpen) {
      const width = window.innerWidth - document.documentElement.clientWidth
      setScrollbarWidth(width > 0 ? width : 0)
    }
  }, [isDrawerOpen])

  /** 當選取文字或區域改變時，更新小點點位置 */
  useEffect(() => {
    if (selectedText && selectionRect && !isDrawerOpen) {
      // 改為跟隨頁面捲動的 absolute 定位
      setDotPosition({
        top: selectionRect.bottom + window.scrollY + 8,
        left: selectionRect.right + window.scrollX - 10
      })
      setDotVisible(true)
    } else {
      setDotVisible(false)
    }
  }, [selectedText, selectionRect, isDrawerOpen])

  /** 擠壓頁面邏輯：根據面板位置設定 body margin */
  useEffect(() => {
    const push = () => {
      document.body.style.transition = "margin 0.3s ease"
      if (drawerPosition === "right") {
        document.body.style.marginRight = `${DRAWER_SIZE}px`
        document.body.style.marginLeft = ""
        document.body.style.marginBottom = ""
      } else if (drawerPosition === "left") {
        document.body.style.marginLeft = `${DRAWER_SIZE}px`
        document.body.style.marginRight = ""
        document.body.style.marginBottom = ""
      } else {
        // bottom
        document.body.style.marginBottom = `${DRAWER_SIZE}px`
        document.body.style.marginRight = ""
        document.body.style.marginLeft = ""
      }
    }

    const restore = () => {
      document.body.style.transition = "margin 0.3s ease"
      document.body.style.marginRight = ""
      document.body.style.marginLeft = ""
      document.body.style.marginBottom = ""
    }

    if (isDrawerOpen) {
      push()
    } else {
      restore()
    }

    return restore
  }, [isDrawerOpen, drawerPosition])

  const translateText = (text: string) => {
    // 採用 useTranslation 提供的翻譯功能
    const currentLanguage = settings.currentLanguage
    const tools = settings.languageConfigs[currentLanguage]?.selectedTools ?? []
    translate(text, currentLanguage, tools)
  }

  useEffect(() => {
    if (!selectedText || !isDrawerOpen || selectedText === activeText) return

    setActiveText(selectedText)
    translateText(selectedText)
  }, [selectedText, activeText, isDrawerOpen])

  /** 當設定（語言或工具）變更時，若 Drawer 開啟則重新翻譯 */
  useEffect(() => {
    if (isDrawerOpen && activeText) {
      translateText(activeText)
    }
  }, [
    settings.currentLanguage,
    settings.languageConfigs[settings.currentLanguage]?.selectedTools,
    isDrawerOpen
  ])

  const handleDotClick = () => {
    setDotVisible(false)
    setIsDrawerOpen(true)
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    clearSelection()
    setActiveText("")
    clearResults()
  }

  const isRight = drawerPosition === "right"
  const isLeft = drawerPosition === "left"

  return (
    <>
      <BlueDot
        visible={dotVisible}
        onClick={handleDotClick}
        top={dotPosition.top}
        left={dotPosition.left}
      />
      {isDrawerOpen && (
        <div
          style={{
            position: "fixed",
            zIndex: 2147483647,
            // 右側：靠右對齊，留滾動條寬度
            right: isRight ? `${scrollbarWidth}px` : isLeft ? "auto" : 0,
            // 左側：靠左對齊，留滾動條寬度
            left: isLeft ? `${scrollbarWidth}px` : isRight ? "auto" : 0,
            // 下方：靠底部，留滾動條高度
            bottom: isRight || isLeft ? 0 : `${scrollbarWidth}px`,
            top: 0,
            width:
              isRight || isLeft ? `${DRAWER_SIZE}px` : "100%",
            height: isRight || isLeft ? "100%" : `${DRAWER_SIZE}px`
          }}>
          <Drawer
            position={drawerPosition}
            results={results}
            selectedText={activeText}
            onClose={handleClose}
            onPositionChange={setDrawerPosition}
          />
        </div>
      )}
    </>
  )
}

export default TranslatorUI
