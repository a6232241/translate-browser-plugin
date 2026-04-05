/**
 * Popup 快速操作頁面
 * 右上角圖示點擊後顯示的快速操作面板
 *
 * 功能:
 * 1. 快速切換翻譯來源語言
 * 2. 開啟設定頁
 */

import React from "react"

import LanguageDropdown from "~src/components/LanguageDropdown"
import { useSettings } from "~src/hooks/useSettings"

import "~src/styles/globals.css"

const PopupPage: React.FC = () => {
  const { settings, isLoaded, setCurrentLanguage } = useSettings()

  if (!isLoaded) {
    return (
      <div className="tp-w-[280px] tp-p-6 tp-flex tp-justify-center tp-items-center tp-font-sans tp-text-gray-400">
        載入中...
      </div>
    )
  }

  return (
    <div className="tp-w-[280px] tp-p-5 tp-font-sans">
      {/* 標題 */}
      <div className="tp-flex tp-items-center tp-gap-2.5 tp-mb-5">
        <div className="tp-w-7 tp-h-7 tp-rounded-md tp-bg-gradient-to-br tp-from-blue-500 tp-to-blue-700 tp-flex tp-items-center tp-justify-center tp-text-sm tp-text-white tp-font-bold">
          譯
        </div>
        <h1 className="tp-text-base tp-font-bold tp-text-gray-900 tp-m-0">
          翻譯插件
        </h1>
      </div>

      {/* 語言快速切換 */}
      <div className="tp-mb-4">
        <LanguageDropdown
          value={settings.currentLanguage}
          onChange={setCurrentLanguage}
          label="翻譯來源語言"
        />
      </div>

      {/* 分隔線 */}
      <div className="tp-h-px tp-bg-gray-100 tp-my-3" />

      {/* 設定頁按鈕 */}
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="tp-w-full tp-p-2.5 tp-px-3.5 tp-rounded-lg tp-border tp-border-solid tp-border-gray-200 tp-bg-white tp-text-[13px] tp-font-medium tp-text-gray-700 tp-flex tp-items-center tp-justify-between tp-transition-all tp-duration-150 tp-shadow-sm hover:tp-bg-gray-50 hover:tp-border-gray-300 tp-cursor-pointer">
        <span className="tp-flex tp-items-center tp-gap-2">⚙️ 進階設定</span>
        <span className="tp-text-gray-400 tp-text-sm">→</span>
      </button>

      {/* 提示 */}
      <p className="tp-text-[11px] tp-text-gray-300 tp-text-center tp-mt-4 tp-mb-0">
        選取網頁文字後，點擊藍色小點即可翻譯
      </p>
    </div>
  )
}

export default PopupPage
