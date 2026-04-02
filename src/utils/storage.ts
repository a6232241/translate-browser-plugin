/**
 * 儲存層封裝
 * 使用 @plasmohq/storage 的 sync 區域實現跨設備同步
 */

import { Storage } from "@plasmohq/storage"

import type { PluginSettings } from "~src/types"
import { DEFAULT_SETTINGS, STORAGE_KEY } from "~src/utils/constants"

/** 建立使用 sync 區域的 Storage 實例 */
const storage = new Storage({ area: "sync" })

/**
 * 從 sync storage 取得插件設定
 * 若無儲存資料則回傳預設值
 */
export async function getSettings(): Promise<PluginSettings> {
  const data = await storage.get<PluginSettings>(STORAGE_KEY)
  if (!data) {
    return DEFAULT_SETTINGS
  }
  return data
}

/**
 * 將插件設定儲存至 sync storage
 * sync storage 可透過 Edge 帳號實現跨設備同步
 */
export async function saveSettings(settings: PluginSettings): Promise<void> {
  await storage.set(STORAGE_KEY, settings)
}

/** 匯出 storage 實例供 hook 使用 */
export { storage }
