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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          color: "#9ca3af"
        }}>
        載入中...
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif"
      }}>
      {/* 儲存中 Spinner */}
      <SyncSpinner visible={isSaving} />

      {/* 頁面標題 */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
          <span
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#ffffff"
            }}>
            譯
          </span>
          翻譯插件設定
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: 0
          }}>
          設定翻譯來源語言和翻譯工具。所有變更將自動同步至您的 Edge 帳號。
        </p>
      </div>

      {/* 語言選擇區 */}
      <div
        style={{
          marginBottom: "28px",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb"
        }}>
        <LanguageDropdown
          value={settings.currentLanguage}
          onChange={setCurrentLanguage}
          label="翻譯來源語言"
        />
        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "8px",
            marginBottom: 0
          }}>
          目標語言固定為<strong>繁體中文</strong>
        </p>
      </div>

      {/* 翻譯工具選擇器 */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "16px"
          }}>
          翻譯工具管理
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginBottom: "16px"
          }}>
          點擊工具可在兩欄間移動，拖曳可調整已選工具的排序。
        </p>
        <ToolSelector
          language={settings.currentLanguage}
          selectedTools={currentConfig?.selectedTools ?? []}
          onChange={handleToolsChange}
        />
      </div>

      {/* 頁腳 */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px 0",
          borderTop: "1px solid #f3f4f6",
          textAlign: "center"
        }}>
        <p
          style={{
            fontSize: "11px",
            color: "#d1d5db",
            margin: 0
          }}>
          翻譯瀏覽器插件 v0.0.1 ｜ 變更將在 3 秒後自動儲存
        </p>
      </div>
    </div>
  )
}

export default OptionsPage
