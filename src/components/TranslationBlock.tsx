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
  const isRich = typeof result.result !== "string"
  const richData = isRich ? (result.result as any) : null

  const playAudio = (url: string) => {
    if (!url) return
    const audio = new Audio(url)
    audio.play().catch((err) => console.error("音頻播放失敗:", err))
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #e5e7eb"
      }}>
      {/* 工具名稱標題 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}>
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#3b82f6",
            margin: 0,
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

        {/* 詞性顯示 */}
        {isRich && richData?.pos && (
          <span
            style={{
              fontSize: "11px",
              fontStyle: "italic",
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "2px 6px",
              borderRadius: "4px"
            }}>
            {richData.pos}
          </span>
        )}
      </div>

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
      ) : isRich ? (
        /* 豐富的翻譯結果 (或 Iframe 備援) */
        richData.iframeUrl ? (
          /* Iframe 備援顯示 */
          <div style={{ marginTop: "4px" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "8px",
                fontFamily: "'Noto Sans TC', sans-serif"
              }}>
              由於存取限制，已為您載入官方網頁：
            </p>
            <iframe
              src={richData.iframeUrl}
              style={{
                width: "100%",
                height: "400px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#ffffff"
              }}
              title="Cambridge Dictionary Fallback"
            />
          </div>
        ) : (
          /* 成功的結構化渲染 (詞性、音標、定義等) */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 音標與發音 */}
            {richData.pronunciations && richData.pronunciations.length > 0 && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {richData.pronunciations.map((pron: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#4b5563"
                    }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>
                      {pron.type}
                    </span>
                    <span style={{ color: "#6b7280" }}>{pron.ipa}</span>
                    {pron.audioUrl && (
                      <button
                        onClick={() => playAudio(pron.audioUrl)}
                        style={{
                          padding: "2px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          lineHeight: 1,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#e5e7eb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                        title="播放發音">
                        🔊
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 定義清單 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {richData.definitions.map((def: any, idx: number) => (
                <div key={idx}>
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#111827"
                    }}>
                    {richData.definitions.length > 1 && (
                      <span style={{ marginRight: "4px", color: "#3b82f6" }}>
                        {idx + 1}.
                      </span>
                    )}
                    {def.chineseTranslation}
                  </div>
                  {def.englishDefinition && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "2px",
                        fontStyle: "italic"
                      }}>
                      {def.englishDefinition}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 例句區塊 */}
            {richData.examples && richData.examples.length > 0 && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "8px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#9ca3af",
                    textTransform: "uppercase"
                  }}>
                  範例例句
                </div>
                {richData.examples.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                    <div style={{ color: "#374151", lineHeight: 1.5 }}>
                      {ex.original}
                    </div>
                    {ex.translation && (
                      <div style={{ color: "#6b7280", marginTop: "2px" }}>
                        {ex.translation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        /* 純文字翻譯結果 (Google) */
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
          {result.result as string}
        </p>
      )}
    </div>
  )
}

export default TranslationBlock
