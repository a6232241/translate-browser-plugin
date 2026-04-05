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
  /** 頂部座標 */
  top: number
  /** 左側座標 */
  left: number
}

const BlueDot: React.FC<BlueDotProps> = ({ visible, onClick, top, left }) => {
  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className="tp-fixed tp-w-6 tp-h-6 tp-rounded-full tp-bg-blue-500 tp-border-2 tp-border-solid tp-border-white tp-shadow-dot tp-cursor-pointer tp-z-[2147483646] tp-p-0 tp-transition-all tp-duration-200 tp-ease-[cubic-bezier(0.175,0.885,0.32,1.275)] tp-animate-fade-in hover:tp-scale-125 hover:tp-shadow-dot-hover"
      style={{
        top: `${top}px`,
        left: `${left}px`
      }}
      title="點擊翻譯選取的文字"
    />
  )
}

export default BlueDot
