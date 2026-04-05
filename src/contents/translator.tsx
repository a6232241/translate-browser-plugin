import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import BlueDot from "~src/components/BlueDot"
import Drawer from "~src/components/Drawer"
import { useSettings } from "~src/hooks/useSettings"
import { useTextSelection } from "~src/hooks/useTextSelection"
import { useTranslation } from "~src/hooks/useTranslation"
import type { DrawerPosition } from "~src/types"
import { DRAWER_SIZE } from "~src/utils/constants"
import cssText from "data-text:~styles/globals.css"

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
  const { results, translate } = useTranslation()

  // 2. 本地 UI 狀態
  const [dotVisible, setDotVisible] = useState(false)
  const [dotPosition, setDotPosition] = useState({ top: 0, left: 0 })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerPosition, setDrawerPosition] = useState<DrawerPosition>("right")
  const [activeText, setActiveText] = useState("")

  /** 取得螢幕方向決定 Drawer 位置 */
  const getAutoPosition = (): DrawerPosition => {
    return window.innerWidth > window.innerHeight ? "right" : "bottom"
  }

  /** 當選取文字或區域改變時，更新小點點位置 */
  useEffect(() => {
    if (selectedText && selectionRect && !isDrawerOpen) {
      setDotPosition({
        top: selectionRect.bottom + 8,
        left: selectionRect.right - 10
      })
      setDotVisible(true)
    } else {
      setDotVisible(false)
    }
  }, [selectedText, selectionRect, isDrawerOpen])

  /** 擠壓頁面邏輯 */
  useEffect(() => {
    const push = () => {
      document.body.style.transition = "margin 0.3s ease"
      if (drawerPosition === "right") {
        document.body.style.marginRight = `${DRAWER_SIZE}px`
      } else {
        document.body.style.marginBottom = `${DRAWER_SIZE}px`
      }
    }

    const restore = () => {
      document.body.style.transition = "margin 0.3s ease"
      document.body.style.marginRight = ""
      document.body.style.marginBottom = ""
    }

    if (isDrawerOpen) {
      push()
    } else {
      restore()
    }

    return restore
  }, [isDrawerOpen, drawerPosition])

  /** 監視視窗大小改變位置 */
  useEffect(() => {
    const handleResize = () => {
      setDrawerPosition(getAutoPosition())
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  const handleDotClick = () => {
    setDotVisible(false)
    setIsDrawerOpen(true)
    setDrawerPosition(getAutoPosition())
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    clearSelection()
  }

  return (
    <>
      <BlueDot
        visible={dotVisible}
        onClick={handleDotClick}
        top={dotPosition.top}
        left={dotPosition.left}
      />
      {isDrawerOpen && (
        <Drawer
          position={drawerPosition}
          results={results}
          selectedText={activeText}
          onClose={handleClose}
        />
      )}
    </>
  )
}

export default TranslatorUI
