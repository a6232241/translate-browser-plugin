/**
 * useDrawerPosition Hook
 * 管理翻譯面板位置偏好的讀取與儲存
 * 使用 local storage 持久化，預設為右側
 */

import { useCallback } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

import type { DrawerPosition } from "~src/types"
import { DRAWER_POSITION_KEY } from "~src/utils/constants"

/** 本地 Storage 實例（使用 local 區域，不需跨裝置同步） */
const localStorage = new Storage({ area: "local" })

interface UseDrawerPositionReturn {
  /** 當前面板位置 */
  drawerPosition: DrawerPosition
  /** 更新並儲存面板位置 */
  setDrawerPosition: (position: DrawerPosition) => void
}

/**
 * 管理翻譯面板顯示位置的 Hook
 * 使用 useStorage 自動同步讀寫 local storage，預設為右側
 */
export function useDrawerPosition(): UseDrawerPositionReturn {
  const [drawerPosition, setStoredPosition] = useStorage<DrawerPosition>(
    {
      key: DRAWER_POSITION_KEY,
      instance: localStorage
    },
    // 預設值為右側
    "right"
  )

  /**
   * 更新面板位置並立即儲存至 local storage
   */
  const setDrawerPosition = useCallback(
    (position: DrawerPosition) => {
      setStoredPosition(position)
    },
    [setStoredPosition]
  )

  return {
    drawerPosition: drawerPosition ?? "right",
    setDrawerPosition
  }
}
