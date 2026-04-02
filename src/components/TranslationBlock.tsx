/**
 * TranslationBlock 元件
 * 顯示單一翻譯工具的翻譯結果區塊
 * 包含工具標題、翻譯結果和 loading 骨架動畫
 */

import React from "react"

import type { TranslationResult } from "~src/types"

interface TranslationBlockProps {
  /** 翻譯結果資料 */
  result: TranslationResult
  /** 是否為列表中最後一個（控制分隔線） */
  isLast: boolean
}

const TranslationBlock: React.FC<TranslationBlockProps> = ({
  result,
  isLast
}) => {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #e5e7eb"
      }}>
      {/* 工具名稱標題 */}
      <h3
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#3b82f6",
          marginBottom: "8px",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          letterSpacing: "0.025em",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            display: "inline-block",
            flexShrink: 0
          }}
        />
        {result.toolName}
      </h3>

      {/* 翻譯結果內容 */}
      {result.isLoading ? (
        /* Loading 骨架動畫 */
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                height: "14px",
                borderRadius: "4px",
                background:
                  "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                width: i === 2 ? "60%" : "100%"
              }}
            />
          ))}
        </div>
      ) : result.error ? (
        /* 錯誤訊息 */
        <p
          style={{
            fontSize: "13px",
            color: "#ef4444",
            margin: 0,
            fontFamily: "'Noto Sans TC', sans-serif",
            lineHeight: 1.6
          }}>
          ⚠ {result.error}
        </p>
      ) : (
        /* 成功的翻譯結果 */
        <p
          style={{
            fontSize: "13px",
            color: "#1f2937",
            margin: 0,
            fontFamily: "'Noto Sans TC', sans-serif",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
          {result.result}
        </p>
      )}
    </div>
  )
}

export default TranslationBlock
