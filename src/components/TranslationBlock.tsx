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
      className={`tp-p-3 tp-px-4 tp-font-sans ${
        isLast ? "" : "tp-border-b tp-border-solid tp-border-gray-100"
      }`}>
      {/* 工具名稱標題 */}
      <div className="tp-flex tp-justify-between tp-items-center tp-mb-2">
        <h3 className="tp-text-[13px] tp-font-bold tp-text-blue-500 tp-m-0 tp-flex tp-items-center tp-gap-1.5 tp-tracking-wide">
          <span className="tp-w-1.5 tp-h-1.5 tp-rounded-full tp-bg-blue-500 tp-flex-shrink-0" />
          {result.toolName}
        </h3>

        {/* 詞性顯示 */}
        {isRich && richData?.pos && (
          <span className="tp-text-[11px] tp-italic tp-text-gray-500 tp-bg-gray-100 tp-p-0.5 tp-px-2 tp-rounded">
            {richData.pos}
          </span>
        )}
      </div>

      {/* 翻譯結果內容 */}
      {result.isLoading ? (
        /* Loading 骨架動畫 */
        <div className="tp-flex tp-flex-col tp-gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`tp-h-3.5 tp-rounded tp-bg-gray-200 tp-animate-pulse ${
                i === 2 ? "tp-w-3/5" : "tp-w-full"
              }`}
            />
          ))}
        </div>
      ) : result.error ? (
        /* 錯誤訊息 */
        <p className="tp-text-[13px] tp-text-red-500 tp-m-0 tp-leading-relaxed">
          ⚠ {result.error}
        </p>
      ) : isRich ? (
        /* 豐富的翻譯結果 (或 Iframe 備援) */
        richData.iframeUrl ? (
          /* Iframe 備援顯示 */
          <div className="tp-mt-1">
            <p className="tp-text-[12px] tp-text-gray-500 tp-mb-2">
              由於存取限制，已為您載入官方網頁：
            </p>
            <iframe
              src={richData.iframeUrl}
              className="tp-w-full tp-h-[400px] tp-border tp-border-solid tp-border-gray-200 tp-rounded-lg tp-bg-white"
              title="Cambridge Dictionary Fallback"
            />
          </div>
        ) : (
          /* 成功的結構化渲染 (詞性、音標、定義等) */
          <div className="tp-flex tp-flex-col tp-gap-2.5">
            {/* 音標與發音 */}
            {richData.pronunciations && richData.pronunciations.length > 0 && (
              <div className="tp-flex tp-gap-3 tp-flex-wrap tp-text-[12px] tp-text-gray-600">
                {richData.pronunciations.map((pron: any, idx: number) => (
                  <div key={idx} className="tp-flex tp-items-center tp-gap-1">
                    <span className="tp-font-bold tp-text-gray-900">
                      {pron.type}
                    </span>
                    <span className="tp-text-gray-500">{pron.ipa}</span>
                    {pron.audioUrl && (
                      <button
                        onClick={() => playAudio(pron.audioUrl)}
                        className="tp-p-0.5 tp-rounded-full tp-bg-transparent tp-border-none tp-cursor-pointer tp-text-[14px] tp-flex tp-items-center tp-justify-center tp-transition-all tp-duration-200 hover:tp-bg-gray-200"
                        title="播放發音">
                        🔊
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 定義清單 */}
            <div className="tp-flex tp-flex-col tp-gap-2">
              {richData.definitions.map((def: any, idx: number) => (
                <div key={idx}>
                  <div className="tp-text-[13px] tp-leading-relaxed tp-text-gray-900">
                    {richData.definitions.length > 1 && (
                      <span className="tp-mr-1 tp-text-blue-500 font-bold">
                        {idx + 1}.
                      </span>
                    )}
                    {def.chineseTranslation}
                  </div>
                  {def.englishDefinition && (
                    <div className="tp-text-[12px] tp-text-gray-400 tp-mt-0.5 tp-italic">
                      {def.englishDefinition}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 例句區塊 */}
            {richData.examples && richData.examples.length > 0 && (
              <div className="tp-mt-1 tp-p-2 tp-bg-gray-50 tp-rounded-md tp-flex tp-flex-col tp-gap-2 tp-border tp-border-solid tp-border-gray-100">
                <div className="tp-text-[10px] tp-font-bold tp-text-gray-400 tp-uppercase tp-tracking-wider">
                  範例例句
                </div>
                {richData.examples.map((ex: any, idx: number) => (
                  <div key={idx} className="tp-text-[12px] tp-flex tp-flex-col">
                    <div className="tp-text-gray-700 tp-leading-normal">
                      {ex.original}
                    </div>
                    {ex.translation && (
                      <div className="tp-text-gray-400 tp-mt-0.5">
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
        <p className="tp-text-[13px] tp-text-gray-800 tp-m-0 tp-leading-loose tp-whitespace-pre-wrap tp-break-words">
          {result.result as string}
        </p>
      )}
    </div>
  )
}

export default TranslationBlock
