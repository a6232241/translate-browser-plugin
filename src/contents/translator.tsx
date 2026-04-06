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
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  /** 取得螢幕方向決定 Drawer 位置 */
  const getAutoPosition = (): DrawerPosition => {
    return window.innerWidth > window.innerHeight ? "right" : "bottom"
  }

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
      // 確保選取文字在可視範圍
      if (selectionRect) {
        const isRight = drawerPosition === "right"
        const scrollTarget = isRight
          ? selectionRect.top + window.scrollY - 100
          : selectionRect.top + window.scrollY - 50
        window.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: "smooth"
        })
      }
    } else {
      restore()
    }

    return restore
  }, [isDrawerOpen, drawerPosition, selectionRect])

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
    setDrawerPosition(getAutoPosition())
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    clearSelection()
  }

  const isRight = drawerPosition === "right"

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
            right: isRight ? `${scrollbarWidth}px` : 0,
            bottom: isRight ? 0 : `${scrollbarWidth}px`,
            top: 0,
            left: isRight ? "auto" : 0,
            width: isRight ? `${DRAWER_SIZE}px` : "100%",
            height: isRight ? "100%" : `${DRAWER_SIZE}px`
          }}>
          <Drawer
            position={drawerPosition}
            results={results}
            selectedText={activeText}
            onClose={handleClose}
          />
        </div>
      )}
    </>
  )
}

export default TranslatorUI
