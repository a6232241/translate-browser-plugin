/**
 * BlueDot 元件
 * 文字選取後出現在右上角的藍色小圓點
 * 點擊後觸發 Drawer 翻譯面板
 */

import React from "react"

interface BlueDotProps {
  /** 是否顯示 */
  visible: boolean
  /** 點擊事件處理 */
  onClick: () => void
}

const BlueDot: React.FC<BlueDotProps> = ({ visible, onClick }) => {
  if (!visible) return null

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#3b82f6",
        border: "2px solid #ffffff",
        boxShadow:
          "0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3)",
        cursor: "pointer",
        zIndex: 2147483646,
        padding: 0,
        transition: "all 0.2s ease",
        animation: "blueDotFadeIn 0.2s ease-in-out"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.3)"
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(59, 130, 246, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.4)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)"
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3)"
      }}
      title="點擊翻譯選取的文字">
      <style>{`
        @keyframes blueDotFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </button>
  )
}

export default BlueDot
