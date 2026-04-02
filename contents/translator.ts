/**
 * Content Script - 翻譯器
 * 核心 Content Script 入口點
 *
 * 使用純 TypeScript content script，手動建立 React root
 * 以實現「擠壓頁面」的 Drawer 行為
 */

import type { PlasmoCSConfig } from "plasmo"

import type {
  DrawerPosition,
  PluginSettings,
  TranslationResult,
  TranslationToolId
} from "~src/types"
import { DRAWER_SIZE, getToolName } from "~src/utils/constants"
import { getSettings } from "~src/utils/storage"

/** Content Script 設定：在所有網頁上執行 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

/* ========== 定義全域 CSS 動畫 ========== */
const STYLE_ID = "translate-plugin-styles"

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    @keyframes tpBlueDotFadeIn {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes tpSlideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    @keyframes tpSlideInBottom {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes tpShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    #tp-blue-dot {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3);
      cursor: pointer;
      z-index: 2147483646;
      padding: 0;
      transition: transform 0.2s ease, opacity 0.2s ease;
      animation: tpBlueDotFadeIn 0.2s ease-in-out;
      display: none;
    }
    #tp-blue-dot:hover {
      transform: scale(1.3);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.4);
    }
    #tp-blue-dot.tp-visible {
      display: block;
    }
    #tp-drawer {
      position: fixed;
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      background-color: #ffffff;
      font-family: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    #tp-drawer.tp-open-right {
      display: flex;
      top: 0;
      right: 0;
      width: ${DRAWER_SIZE}px;
      height: 100vh;
      border-left: 1px solid #e5e7eb;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
      animation: tpSlideInRight 0.3s ease-out;
    }
    #tp-drawer.tp-open-bottom {
      display: flex;
      bottom: 0;
      left: 0;
      width: 100vw;
      height: ${DRAWER_SIZE}px;
      border-top: 1px solid #e5e7eb;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
      animation: tpSlideInBottom 0.3s ease-out;
    }
    #tp-drawer-header {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      background-color: #f8fafc;
      flex-shrink: 0;
    }
    #tp-drawer-close {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background-color: transparent;
      color: #6b7280;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    #tp-drawer-close:hover {
      background-color: #fee2e2;
      color: #ef4444;
    }
    #tp-drawer-title {
      margin-left: 8px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    #tp-drawer-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .tp-block {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .tp-block:last-child {
      border-bottom: none;
    }
    .tp-block-title {
      font-size: 13px;
      font-weight: 600;
      color: #3b82f6;
      margin: 0 0 8px 0;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tp-block-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #3b82f6;
      display: inline-block;
      flex-shrink: 0;
    }
    .tp-block-result {
      font-size: 13px;
      color: #1f2937;
      margin: 0;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .tp-block-error {
      font-size: 13px;
      color: #ef4444;
      margin: 0;
      line-height: 1.6;
    }
    .tp-skeleton {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tp-skeleton-line {
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: tpShimmer 1.5s ease-in-out infinite;
    }
    .tp-empty {
      padding: 24px 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }
  `
  document.head.appendChild(style)
}

/* ========== DOM 建立 ========== */

let blueDot: HTMLButtonElement | null = null
let drawer: HTMLDivElement | null = null
let drawerContent: HTMLDivElement | null = null
let drawerTitle: HTMLDivElement | null = null

let currentText = ""
let isDrawerOpen = false
let currentPosition: DrawerPosition = "right"

/** 建立 UI 元素 */
function createUI() {
  if (document.getElementById("tp-blue-dot")) return

  injectStyles()

  // 藍色小點
  blueDot = document.createElement("button")
  blueDot.id = "tp-blue-dot"
  blueDot.title = "點擊翻譯選取的文字"
  blueDot.addEventListener("click", handleBlueDotClick)
  document.body.appendChild(blueDot)

  // Drawer
  drawer = document.createElement("div")
  drawer.id = "tp-drawer"

  // Drawer 標題列
  const header = document.createElement("div")
  header.id = "tp-drawer-header"

  const closeBtn = document.createElement("button")
  closeBtn.id = "tp-drawer-close"
  closeBtn.textContent = "✕"
  closeBtn.title = "關閉翻譯面板"
  closeBtn.addEventListener("click", handleClose)

  drawerTitle = document.createElement("div")
  drawerTitle.id = "tp-drawer-title"

  header.appendChild(closeBtn)
  header.appendChild(drawerTitle)
  drawer.appendChild(header)

  // Drawer 內容區
  drawerContent = document.createElement("div")
  drawerContent.id = "tp-drawer-content"
  drawer.appendChild(drawerContent)

  document.body.appendChild(drawer)
}

/* ========== 事件處理 ========== */

/** 取得 Drawer 位置 */
function getDrawerPosition(): DrawerPosition {
  return window.innerWidth > window.innerHeight ? "right" : "bottom"
}

/** 擠壓頁面佈局 */
function pushPageContent(position: DrawerPosition) {
  document.body.style.transition = "margin 0.3s ease"
  if (position === "right") {
    document.body.style.marginRight = `${DRAWER_SIZE}px`
  } else {
    document.body.style.marginBottom = `${DRAWER_SIZE}px`
  }
}

/** 恢復頁面佈局 */
function restorePageContent() {
  document.body.style.transition = "margin 0.3s ease"
  document.body.style.marginRight = ""
  document.body.style.marginBottom = ""
}

/** 渲染翻譯結果到 Drawer */
function renderResults(results: TranslationResult[]) {
  if (!drawerContent) return

  drawerContent.innerHTML = ""

  if (results.length === 0) {
    const empty = document.createElement("div")
    empty.className = "tp-empty"
    empty.textContent = "沒有可用的翻譯工具，請至設定頁選取翻譯工具"
    drawerContent.appendChild(empty)
    return
  }

  results.forEach((result) => {
    const block = document.createElement("div")
    block.className = "tp-block"

    // 標題
    const title = document.createElement("h3")
    title.className = "tp-block-title"
    const dot = document.createElement("span")
    dot.className = "tp-block-dot"
    title.appendChild(dot)
    title.appendChild(document.createTextNode(result.toolName))
    block.appendChild(title)

    // 內容
    if (result.isLoading) {
      const skeleton = document.createElement("div")
      skeleton.className = "tp-skeleton"
      ;[100, 80, 60].forEach((w) => {
        const line = document.createElement("div")
        line.className = "tp-skeleton-line"
        line.style.width = `${w}%`
        skeleton.appendChild(line)
      })
      block.appendChild(skeleton)
    } else if (result.error) {
      const errorEl = document.createElement("p")
      errorEl.className = "tp-block-error"
      errorEl.textContent = `⚠ ${result.error}`
      block.appendChild(errorEl)
    } else {
      const resultEl = document.createElement("p")
      resultEl.className = "tp-block-result"
      resultEl.textContent = result.result
      block.appendChild(resultEl)
    }

    drawerContent!.appendChild(block)
  })
}

/** 執行翻譯 */
async function performTranslation(text: string) {
  try {
    const settings: PluginSettings = await getSettings()
    const language = settings.currentLanguage
    const langConfig = settings.languageConfigs[language]
    const tools = langConfig?.selectedTools ?? []

    if (tools.length === 0) {
      renderResults([])
      return
    }

    // 設定 loading 狀態
    const loadingResults: TranslationResult[] = tools.map(
      (toolId: TranslationToolId) => ({
        toolId,
        toolName: getToolName(toolId),
        result: "",
        isLoading: true
      })
    )
    renderResults(loadingResults)

    // 並行翻譯
    const promises = tools.map(async (toolId: TranslationToolId) => {
      try {
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

    const completed = await Promise.all(promises)

    // 按原始順序排列結果
    const ordered = tools.map(
      (toolId: TranslationToolId) =>
        completed.find((r) => r.toolId === toolId) ?? {
          toolId,
          toolName: getToolName(toolId),
          result: "",
          isLoading: false,
          error: "翻譯失敗"
        }
    )

    renderResults(ordered)
  } catch (error) {
    console.error("翻譯過程發生錯誤:", error)
  }
}

/** 藍色小點點擊處理 */
function handleBlueDotClick() {
  if (!currentText) return

  const position = getDrawerPosition()
  currentPosition = position

  if (!isDrawerOpen) {
    // 第一次開啟
    isDrawerOpen = true
    if (drawer) {
      drawer.className =
        position === "right" ? "tp-open-right" : "tp-open-bottom"
    }
    pushPageContent(position)
  }
  // Drawer 已開啟時，僅更新翻譯內容

  if (drawerTitle) {
    drawerTitle.textContent = currentText
    drawerTitle.title = currentText
  }

  performTranslation(currentText)
}

/** 關閉 Drawer */
function handleClose() {
  isDrawerOpen = false
  if (drawer) {
    drawer.className = ""
  }
  restorePageContent()
  if (drawerContent) {
    drawerContent.innerHTML = ""
  }
}

/** 監聽文字選取 */
function setupTextSelection() {
  document.addEventListener("mouseup", (e) => {
    // 忽略在插件 UI 上的點擊
    const target = e.target as HTMLElement
    if (
      target.id === "tp-blue-dot" ||
      target.closest("#tp-drawer") ||
      target.closest("#tp-blue-dot")
    ) {
      return
    }

    setTimeout(() => {
      const selection = document.getSelection()
      const text = selection?.toString().trim() ?? ""

      if (text.length > 0 && selection && selection.rangeCount > 0) {
        currentText = text
        
        // 計算選取文字的範圍邊界
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        if (blueDot) {
          // 設定位置到右下角（考慮滾動偏移）
          const dotSize = 20
          blueDot.style.top = `${rect.bottom + window.scrollY + 5}px`
          blueDot.style.left = `${rect.right + window.scrollX - 10}px`
          blueDot.classList.add("tp-visible")
        }
      } else if (!isDrawerOpen) {
        blueDot?.classList.remove("tp-visible")
      }
    }, 10)
  })
}

/** 監聽視窗大小改變 */
function setupResizeHandler() {
  window.addEventListener("resize", () => {
    if (!isDrawerOpen || !drawer) return

    const newPosition = getDrawerPosition()
    if (newPosition !== currentPosition) {
      restorePageContent()
      currentPosition = newPosition
      drawer.className =
        newPosition === "right" ? "tp-open-right" : "tp-open-bottom"
      pushPageContent(newPosition)
    }
  })
}

/* ========== 初始化 ========== */

function init() {
  createUI()
  setupTextSelection()
  setupResizeHandler()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
