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
      <div
        style={{
          width: "280px",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
        width: "280px",
        padding: "20px",
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif"
      }}>
      {/* 標題 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px"
        }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            color: "#ffffff",
            fontWeight: 700
          }}>
          譯
        </div>
        <h1
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#111827",
            margin: 0
          }}>
          翻譯插件
        </h1>
      </div>

      {/* 語言快速切換 */}
      <div style={{ marginBottom: "16px" }}>
        <LanguageDropdown
          value={settings.currentLanguage}
          onChange={setCurrentLanguage}
          label="翻譯來源語言"
        />
      </div>

      {/* 分隔線 */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#f3f4f6",
          margin: "12px 0"
        }}
      />

      {/* 設定頁按鈕 */}
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          fontSize: "13px",
          color: "#374151",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.15s ease",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f9fafb"
          e.currentTarget.style.borderColor = "#d1d5db"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#ffffff"
          e.currentTarget.style.borderColor = "#e5e7eb"
        }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          ⚙️ 進階設定
        </span>
        <span style={{ color: "#9ca3af", fontSize: "14px" }}>→</span>
      </button>

      {/* 提示 */}
      <p
        style={{
          fontSize: "11px",
          color: "#d1d5db",
          textAlign: "center",
          marginTop: "16px",
          marginBottom: 0
        }}>
        選取網頁文字後，點擊藍色小點即可翻譯
      </p>
    </div>
  )
}

export default PopupPage
