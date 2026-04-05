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
    <div className="tp-fixed tp-top-4 tp-left-4 tp-flex tp-items-center tp-gap-2 tp-p-1.5 tp-px-3 tp-rounded-full tp-bg-blue-500/10 tp-border tp-border-solid tp-border-blue-500/20 tp-z-[1000] tp-animate-fade-in tp-font-sans">
      {/* Spinner SVG 動畫 */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="tp-animate-spin">
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

      <span className="tp-text-[11px] tp-text-blue-500 tp-font-medium">
        儲存中...
      </span>
    </div>
  )
}

export default SyncSpinner
