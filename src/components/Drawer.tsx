/**
 * Drawer 元件
 * 翻譯結果面板，以擠壓方式推開頁面內容
 * 根據螢幕方向決定出現位置（右側或底部）
 */

import React from "react"

import type { DrawerPosition, TranslationResult } from "~src/types"
import { DRAWER_SIZE } from "~src/utils/constants"

import TranslationBlock from "./TranslationBlock"

interface DrawerProps {
  /** Drawer 顯示位置 */
  position: DrawerPosition
  /** 翻譯結果列表 */
  results: TranslationResult[]
  /** 被翻譯的原始文字 */
  selectedText: string
  /** 關閉 Drawer 的回呼 */
  onClose: () => void
}

const Drawer: React.FC<DrawerProps> = ({
  position,
  results,
  selectedText,
  onClose
}) => {
  const isRight = position === "right"

  return (
    <div
      className={`tp-fixed tp-z-[2147483647] tp-flex tp-flex-col tp-bg-white tp-border-solid tp-font-sans ${
        isRight
          ? "tp-top-0 tp-right-0 tp-h-screen tp-border-l tp-border-gray-200 tp-shadow-drawer-right tp-animate-slide-in-right"
          : "tp-bottom-0 tp-left-0 tp-w-screen tp-border-t tp-border-gray-200 tp-shadow-drawer-bottom tp-animate-slide-in-bottom"
      }`}
      style={{
        width: isRight ? `${DRAWER_SIZE}px` : "100vw",
        height: isRight ? "100vh" : `${DRAWER_SIZE}px`
      }}>
      {/* 標題列：僅保留關閉按鈕與面板標籤 */}
      <div className="tp-flex tp-items-center tp-p-2 tp-px-3 tp-border-b tp-border-solid tp-border-gray-200 tp-bg-white tp-flex-shrink-0">
        <button
          onClick={onClose}
          className="tp-w-7 tp-h-7 tp-rounded-md tp-border-none tp-bg-transparent tp-text-gray-400 tp-text-base tp-cursor-pointer tp-flex tp-items-center tp-justify-center tp-flex-shrink-0 tp-transition-all tp-duration-150 hover:tp-bg-gray-100 hover:tp-text-gray-700"
          title="關閉翻譯面板">
          ✕
        </button>
        <div className="tp-ml-2 tp-text-[12px] tp-font-bold tp-text-gray-400 tp-uppercase tp-tracking-wider">
          翻譯面板
        </div>
      </div>

      {/* 翻譯結果列表（可滾動區域） */}
      <div className="tp-flex-1 tp-overflow-y-auto tp-overflow-x-hidden">
        {/* 原文文字區塊 */}
        <div className="tp-p-4 tp-bg-gray-50/50 tp-border-b tp-border-solid tp-border-gray-100">
          <div className="tp-text-[10px] tp-font-bold tp-text-gray-400 tp-uppercase tp-tracking-wider tp-mb-2">
            原文
          </div>
          <div className="tp-text-[14px] tp-text-gray-800 tp-leading-relaxed tp-whitespace-pre-wrap tp-break-words">
            {selectedText}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="tp-p-6 tp-px-4 tp-text-center tp-text-[#9ca3af] tp-text-[13px] tp-font-sans">
            沒有可用的翻譯工具，請至設定頁選取翻譯工具
          </div>
        ) : (
          results.map((result, index) => (
            <TranslationBlock
              key={result.toolId}
              result={result}
              isLast={index === results.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Drawer
