/**
 * LanguageDropdown 元件
 * 共用的語言選擇下拉選單
 * 用於 Options 頁和 Popup 中快速切換翻譯語言
 */

import React from "react"

import type { SourceLanguage } from "~src/types"
import { SUPPORTED_LANGUAGES } from "~src/utils/constants"

interface LanguageDropdownProps {
  /** 當前選取的語言 */
  value: SourceLanguage
  /** 語言變更回呼 */
  onChange: (language: SourceLanguage) => void
  /** 選單標籤（選填） */
  label?: string
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  value,
  onChange,
  label
}) => {
  return (
    <div className="tp-flex tp-flex-col tp-gap-1.5 tp-font-sans">
      {label && (
        <label className="tp-text-[11px] tp-font-bold tp-text-gray-400 tp-uppercase tp-tracking-wider">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SourceLanguage)}
        className="tp-p-2 tp-px-3 tp-pr-10 tp-rounded-lg tp-border tp-border-solid tp-border-gray-300 tp-bg-white tp-text-sm tp-text-gray-800 tp-cursor-pointer tp-outline-none tp-transition-all tp-duration-150 tp-shadow-sm tp-appearance-none tp-bg-no-repeat tp-bg-[right_10px_center] tp-bg-[length:18px] focus:tp-border-blue-500 focus:tp-ring-4 focus:tp-ring-blue-500/15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
        }}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageDropdown
