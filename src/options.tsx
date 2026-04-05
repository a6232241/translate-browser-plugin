/**
 * Options 設定頁
 * 獨立頁面，設定翻譯語言和翻譯工具的選取與排序
 *
 * 功能:
 * 1. Dropdown 選擇翻譯來源語言（英文 / 日文）
 * 2. 雙欄拖曳 / 點擊選取翻譯工具
 * 3. 每次操作後 3 秒自動儲存至 Edge 帳號
 * 4. 切換語言時載入對應設定
 */

import React from "react"

import LanguageDropdown from "~src/components/LanguageDropdown"
import SyncSpinner from "~src/components/SyncSpinner"
import ToolSelector from "~src/components/ToolSelector"
import { useSettings } from "~src/hooks/useSettings"
import type { TranslationToolId } from "~src/types"

import "~src/styles/globals.css"

const OptionsPage: React.FC = () => {
  const {
    settings,
    isSaving,
    isLoaded,
    setCurrentLanguage,
    updateLanguageConfig
  } = useSettings()

  /** 當前語言的已選工具配置 */
  const currentConfig = settings.languageConfigs[settings.currentLanguage]

  /** 處理工具選取變更 */
  const handleToolsChange = (tools: TranslationToolId[]) => {
    updateLanguageConfig(settings.currentLanguage, {
      selectedTools: tools
    })
  }

  if (!isLoaded) {
    return (
      <div className="tp-flex tp-justify-center tp-items-center tp-h-screen tp-font-sans tp-text-gray-400">
        載入中...
      </div>
    )
  }

  return (
    <div className="tp-max-w-[640px] tp-mx-auto tp-p-8 tp-px-6 tp-font-sans">
      {/* 儲存中 Spinner */}
      <SyncSpinner visible={isSaving} />

      {/* 頁面標題 */}
      <div className="tp-mb-8">
        <h1 className="tp-text-2xl tp-font-bold tp-text-gray-900 tp-mb-2 tp-flex tp-items-center tp-gap-2.5">
          <span className="tp-w-8 tp-h-8 tp-rounded-lg tp-bg-gradient-to-br tp-from-blue-500 tp-to-blue-700 tp-flex tp-items-center tp-justify-center tp-text-base tp-text-white tp-font-bold">
            譯
          </span>
          翻譯插件設定
        </h1>
        <p className="tp-text-sm tp-text-gray-500 tp-m-0">
          設定翻譯來源語言和翻譯工具。所有變更將自動同步至您的 Edge 帳號。
        </p>
      </div>

      {/* 語言選擇區 */}
      <div className="tp-mb-7 tp-p-5 tp-rounded-xl tp-bg-gray-50 tp-border tp-border-solid tp-border-gray-200">
        <LanguageDropdown
          value={settings.currentLanguage}
          onChange={setCurrentLanguage}
          label="翻譯來源語言"
        />
        <p className="tp-text-xs tp-text-gray-400 tp-mt-2 tp-mb-0">
          目標語言固定為<strong>繁體中文</strong>
        </p>
      </div>

      {/* 翻譯工具選擇器 */}
      <div className="tp-p-5 tp-rounded-xl tp-bg-white tp-border tp-border-solid tp-border-gray-200 tp-shadow-sm">
        <h2 className="tp-text-base tp-font-semibold tp-text-gray-700 tp-mb-4">
          翻譯工具管理
        </h2>
        <p className="tp-text-xs tp-text-gray-400 tp-mb-4">
          點擊工具可在兩欄間移動，拖曳可調整已選工具的排序。
        </p>
        <ToolSelector
          language={settings.currentLanguage}
          selectedTools={currentConfig?.selectedTools ?? []}
          onChange={handleToolsChange}
        />
      </div>

      {/* 頁腳 */}
      <div className="tp-mt-8 tp-p-4 tp-border-t tp-border-solid tp-border-gray-100 tp-text-center">
        <p className="tp-text-[11px] tp-text-gray-300 tp-m-0">
          翻譯瀏覽器插件 v0.0.1 ｜ 變更將在 3 秒後自動儲存
        </p>
      </div>
    </div>
  )
}

export default OptionsPage
