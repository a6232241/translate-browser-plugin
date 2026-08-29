/**
 * Drawer 元件
 * 翻譯結果面板，以擠壓方式推開頁面內容
 * Header 右側提供三個按鈕讓使用者手動切換面板位置（右側、左側、下方）
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
  /** 切換 Drawer 位置的回呼 */
  onPositionChange: (position: DrawerPosition) => void
}

/** 位置切換按鈕的設定清單 */
const POSITION_BUTTONS: {
  position: DrawerPosition
  title: string
  /** SVG path 字串 */
  icon: React.ReactNode
}[] = [
  {
    position: "right",
    title: "固定於右側",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        {/* 面板靠右：外框 + 右側色塊 */}
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    )
  },
  {
    position: "left",
    title: "固定於左側",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        {/* 面板靠左：外框 + 左側色塊 */}
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    )
  },
  {
    position: "bottom",
    title: "固定於下方",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        {/* 面板靠下：外框 + 下方色塊 */}
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    )
  }
]

const Drawer: React.FC<DrawerProps> = ({
  position,
  results,
  selectedText,
  onClose,
  onPositionChange
}) => {
  const isRight = position === "right"
  const isLeft = position === "left"
  const isBottom = position === "bottom"

  return (
    <div
      className={`tp-fixed tp-z-[2147483647] tp-flex tp-flex-col tp-bg-white tp-border-solid tp-font-sans ${
        isRight
          ? "tp-top-0 tp-right-0 tp-h-screen tp-border-l tp-border-gray-200 tp-shadow-drawer-right tp-animate-slide-in-right"
          : isLeft
            ? "tp-top-0 tp-left-0 tp-h-screen tp-border-r tp-border-gray-200 tp-shadow-drawer-left tp-animate-slide-in-left"
            : "tp-bottom-0 tp-left-0 tp-w-screen tp-border-t tp-border-gray-200 tp-shadow-drawer-bottom tp-animate-slide-in-bottom"
      }`}
      style={{
        width: isBottom ? "100vw" : `${DRAWER_SIZE}px`,
        height: isBottom ? `${DRAWER_SIZE}px` : "100vh"
      }}>
      {/* 標題列：關閉按鈕、面板標籤、位置切換按鈕 */}
      <div className="tp-flex tp-items-center tp-p-2 tp-px-3 tp-border-b tp-border-solid tp-border-gray-200 tp-bg-white tp-flex-shrink-0">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="tp-w-7 tp-h-7 tp-rounded-md tp-border-none tp-bg-transparent tp-text-gray-400 tp-text-base tp-cursor-pointer tp-flex tp-items-center tp-justify-center tp-flex-shrink-0 tp-transition-all tp-duration-150 hover:tp-bg-gray-100 hover:tp-text-gray-700"
          title="關閉翻譯面板">
          ✕
        </button>

        {/* 面板標籤 */}
        <div className="tp-ml-2 tp-text-[12px] tp-font-bold tp-text-gray-400 tp-uppercase tp-tracking-wider tp-flex-1">
          翻譯面板
        </div>

        {/* 位置切換按鈕群組 */}
        <div
          className="tp-flex tp-items-center tp-gap-0.5"
          role="group"
          aria-label="翻譯面板位置">
          {POSITION_BUTTONS.map(({ position: pos, title, icon }) => {
            const isActive = position === pos
            return (
              <button
                key={pos}
                onClick={() => onPositionChange(pos)}
                title={title}
                aria-pressed={isActive}
                className={`tp-w-7 tp-h-7 tp-rounded-md tp-border-none tp-cursor-pointer tp-flex tp-items-center tp-justify-center tp-flex-shrink-0 tp-transition-all tp-duration-150 ${
                  isActive
                    ? "tp-bg-blue-50 tp-text-blue-500"
                    : "tp-bg-transparent tp-text-gray-400 hover:tp-bg-gray-100 hover:tp-text-gray-700"
                }`}>
                {icon}
              </button>
            )
          })}
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
