/**
 * SyncSpinner 元件
 * 在設定儲存過程中顯示的旋轉動畫
 * 固定在左上角，小巧且不干擾操作
 */

import React from "react"

interface SyncSpinnerProps {
  /** 是否顯示 spinner */
  visible: boolean
}

const SyncSpinner: React.FC<SyncSpinnerProps> = ({ visible }) => {
  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "20px",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        zIndex: 1000,
        animation: "spinnerFadeIn 0.2s ease"
      }}>
      {/* Spinner SVG 動畫 */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "spinnerRotate 1s linear infinite" }}>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.42"
          strokeDashoffset="10"
        />
      </svg>

      <span
        style={{
          fontSize: "11px",
          color: "#3b82f6",
          fontWeight: 500,
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif"
        }}>
        儲存中...
      </span>

      <style>{`
        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinnerFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default SyncSpinner
