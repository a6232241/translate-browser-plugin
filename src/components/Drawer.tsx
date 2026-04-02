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
  /** 根據 position 計算容器樣式 */
  const containerStyle: React.CSSProperties =
    position === "right"
      ? {
          position: "fixed",
          top: 0,
          right: 0,
          width: `${DRAWER_SIZE}px`,
          height: "100vh",
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          borderLeft: "1px solid #e5e7eb",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)",
          animation: "slideInRight 0.3s ease-out"
        }
      : {
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: `${DRAWER_SIZE}px`,
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.08)",
          animation: "slideInBottom 0.3s ease-out"
        }

  return (
    <div style={containerStyle}>
      {/* 標題列：關閉按鈕 + 選取文字 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f8fafc",
          flexShrink: 0
        }}>
        {/* 關閉按鈕 (左上角叉叉) */}
        <button
          onClick={onClose}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "transparent",
            color: "#6b7280",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fee2e2"
            e.currentTarget.style.color = "#ef4444"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#6b7280"
          }}
          title="關閉翻譯面板">
          ✕
        </button>

        {/* 選取的文字 */}
        <div
          style={{
            marginLeft: "8px",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif"
          }}
          title={selectedText}>
          {selectedText}
        </div>
      </div>

      {/* 翻譯結果列表（可滾動區域） */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden"
        }}>
        {results.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "13px",
              fontFamily: "'Noto Sans TC', sans-serif"
            }}>
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

      {/* 樣式定義（keyframes 動畫） */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export default Drawer
