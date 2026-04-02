/**
 * useSettings Hook
 * 管理插件設定的讀取、更新和自動儲存邏輯
 * 實現 3 秒 debounce 自動儲存至 sync storage
 */

import { useCallback, useEffect, useRef, useState } from "react"

import type { LanguageSettings, PluginSettings, SourceLanguage } from "~src/types"
import { AUTO_SAVE_DELAY, DEFAULT_SETTINGS, STORAGE_KEY } from "~src/utils/constants"
import { getSettings, saveSettings } from "~src/utils/storage"

interface UseSettingsReturn {
  /** 當前插件設定 */
  settings: PluginSettings
  /** 是否正在儲存中 */
  isSaving: boolean
  /** 設定是否已載入 */
  isLoaded: boolean
  /** 切換當前語言 */
  setCurrentLanguage: (language: SourceLanguage) => void
  /** 更新指定語言的工具設定 */
  updateLanguageConfig: (
    language: SourceLanguage,
    config: LanguageSettings
  ) => void
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  /** debounce timer ref */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 載入初始設定 */
  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data)
      setIsLoaded(true)
    })
  }, [])

  /**
   * 排程自動儲存
   * 每次觸發時重新倒計 3 秒，3 秒內沒有新操作才執行儲存
   */
  const scheduleSave = useCallback((newSettings: PluginSettings) => {
    // 顯示儲存中 spinner
    setIsSaving(true)

    // 清除上一次的計時器（重新倒計）
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // 設定 3 秒後自動儲存
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error("儲存設定失敗:", error)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY)
  }, [])

  /** 切換當前來源語言 */
  const setCurrentLanguage = useCallback(
    (language: SourceLanguage) => {
      const newSettings: PluginSettings = {
        ...settings,
        currentLanguage: language
      }
      setSettings(newSettings)
      scheduleSave(newSettings)
    },
    [settings, scheduleSave]
  )

  /** 更新指定語言的翻譯工具設定 */
  const updateLanguageConfig = useCallback(
    (language: SourceLanguage, config: LanguageSettings) => {
      const newSettings: PluginSettings = {
        ...settings,
        languageConfigs: {
          ...settings.languageConfigs,
          [language]: config
        }
      }
      setSettings(newSettings)
      scheduleSave(newSettings)
    },
    [settings, scheduleSave]
  )

  /** 清理：組件卸載時清除計時器 */
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return {
    settings,
    isSaving,
    isLoaded,
    setCurrentLanguage,
    updateLanguageConfig
  }
}
