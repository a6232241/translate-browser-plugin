/**
 * useSettings Hook
 * 管理插件設定的讀取、更新和自動儲存邏輯
 * 實現 3 秒 debounce 自動儲存至 sync storage
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"

import type { LanguageSettings, PluginSettings, SourceLanguage } from "~src/types"
import { AUTO_SAVE_DELAY, DEFAULT_SETTINGS, STORAGE_KEY } from "~src/utils/constants"
import { saveSettings } from "~src/utils/storage"

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
  // 使用 useStorage 進行即時即時同步
  const [settings, setSettings, { isLoading }] = useStorage<PluginSettings>(
    {
      key: STORAGE_KEY,
      instance: new (require("@plasmohq/storage").Storage)({ area: "sync" })
    },
    DEFAULT_SETTINGS
  )

  const [isSaving, setIsSaving] = useState(false)

  /** debounce timer ref */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 排程自動儲存 (輔助 Hook，實際 setter 已由 useStorage 處理，但為了保留 isSaving 狀態需包裝)
   */
  const scheduleSave = useCallback((newSettings: PluginSettings) => {
    // 顯示儲存中 spinner
    setIsSaving(true)

    // 清除上一次的計時器
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // 設定 0.5 秒後關閉 spinner (實際儲存也在這裡執行，雖然 useStorage 已處理部分 setter)
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
    [settings, setSettings, scheduleSave]
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
    [settings, setSettings, scheduleSave]
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
    settings: settings || DEFAULT_SETTINGS,
    isSaving,
    isLoaded: !isLoading,
    setCurrentLanguage,
    updateLanguageConfig
  }
}
