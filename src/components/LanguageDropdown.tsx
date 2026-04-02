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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif"
          }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SourceLanguage)}
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          backgroundColor: "#ffffff",
          fontSize: "14px",
          color: "#1f2937",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.15s ease",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 8px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "20px",
          paddingRight: "36px"
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#3b82f6"
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(59, 130, 246, 0.15)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db"
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)"
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
