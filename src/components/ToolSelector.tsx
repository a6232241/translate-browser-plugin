/**
 * ToolSelector 元件
 * 雙欄翻譯工具選擇器，支援點擊切換和拖曳排序
 *
 * 左欄：可選的翻譯工具
 * 右欄：已選的翻譯工具（可排序）
 *
 * 使用 @dnd-kit 實現拖曳功能
 */

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React, { useMemo, useState } from "react"

import type { TranslationToolId } from "~src/types"
import { getToolsForLanguage } from "~src/utils/constants"
import type { SourceLanguage } from "~src/types"

interface ToolSelectorProps {
  /** 當前語言 */
  language: SourceLanguage
  /** 已選的工具 ID 列表（有排序） */
  selectedTools: TranslationToolId[]
  /** 工具選取變更回呼 */
  onChange: (tools: TranslationToolId[]) => void
}

/** 單一工具卡片元件（可拖曳版） */
const SortableToolCard: React.FC<{
  id: TranslationToolId
  name: string
  onClick: () => void
}> = ({ id, name, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginBottom: "6px",
        transition: "all 0.15s ease",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
      }}
      {...attributes}
      {...listeners}>
      {/* 拖曳把手 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            color: "#d1d5db",
            fontSize: "14px",
            lineHeight: 1,
            cursor: "grab"
          }}>
          ⠿
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "#374151",
            fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
            fontWeight: 500
          }}>
          {name}
        </span>
      </div>

      {/* 點擊移動按鈕 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "transparent",
          color: "#9ca3af",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
          e.currentTarget.style.color = "#374151"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent"
          e.currentTarget.style.color = "#9ca3af"
        }}
        title="點擊移動">
        ↔
      </button>
    </div>
  )
}

/** 靜態工具卡片（不可拖曳/排序，左欄使用） */
const StaticToolCard: React.FC<{
  name: string
  onClick: () => void
}> = ({ name, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginBottom: "6px",
        transition: "all 0.15s ease",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#eff6ff"
        e.currentTarget.style.borderColor = "#bfdbfe"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#ffffff"
        e.currentTarget.style.borderColor = "#e5e7eb"
      }}>
      <span
        style={{
          fontSize: "13px",
          color: "#374151",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          fontWeight: 500
        }}>
        {name}
      </span>
      <span style={{ fontSize: "14px", color: "#9ca3af" }}>→</span>
    </div>
  )
}

/** 拖曳中的重疊顯示卡片 */
const DragOverlayCard: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #3b82f6",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
        cursor: "grabbing"
      }}>
      <span style={{ color: "#3b82f6", fontSize: "14px" }}>⠿</span>
      <span
        style={{
          fontSize: "13px",
          color: "#1e40af",
          fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
          fontWeight: 600
        }}>
        {name}
      </span>
    </div>
  )
}

const ToolSelector: React.FC<ToolSelectorProps> = ({
  language,
  selectedTools,
  onChange
}) => {
  const [activeId, setActiveId] = useState<TranslationToolId | null>(null)

  /** 拖曳感測器設定（需要最少 8px 移動才觸發，避免和點擊衝突） */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  /** 取得當前語言可用的所有翻譯工具 */
  const allTools = useMemo(
    () => getToolsForLanguage(language),
    [language]
  )

  /** 可選工具（未被選取的） */
  const availableTools = useMemo(
    () => allTools.filter((t) => !selectedTools.includes(t.id)),
    [allTools, selectedTools]
  )

  /** 將工具從可選區移到已選區 */
  const addTool = (toolId: TranslationToolId) => {
    onChange([...selectedTools, toolId])
  }

  /** 將工具從已選區移到可選區 */
  const removeTool = (toolId: TranslationToolId) => {
    onChange(selectedTools.filter((id) => id !== toolId))
  }

  /** 拖曳開始 */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as TranslationToolId)
  }

  /** 拖曳結束：處理排序 */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = selectedTools.indexOf(active.id as TranslationToolId)
    const newIndex = selectedTools.indexOf(over.id as TranslationToolId)

    if (oldIndex === -1 || newIndex === -1) return

    const newTools = [...selectedTools]
    newTools.splice(oldIndex, 1)
    newTools.splice(newIndex, 0, active.id as TranslationToolId)
    onChange(newTools)
  }

  /** 取得拖曳中的工具名稱 */
  const activeTool = allTools.find((t) => t.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "16px", minHeight: "200px" }}>
        {/* 左欄：可選的翻譯工具 */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "10px",
              fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
            可選的翻譯工具
          </h3>
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              backgroundColor: "#f9fafb",
              border: "1px dashed #d1d5db",
              minHeight: "120px"
            }}>
            {availableTools.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "12px",
                  fontFamily: "'Noto Sans TC', sans-serif"
                }}>
                所有工具已選取
              </div>
            ) : (
              availableTools.map((tool) => (
                <StaticToolCard
                  key={tool.id}
                  name={tool.name}
                  onClick={() => addTool(tool.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* 右欄：已選的翻譯工具（可排序） */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "10px",
              fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
            已選的翻譯工具
          </h3>
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              backgroundColor: "#f0f9ff",
              border: "1px dashed #93c5fd",
              minHeight: "120px"
            }}>
            {selectedTools.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "12px",
                  fontFamily: "'Noto Sans TC', sans-serif"
                }}>
                請從左側選取工具
              </div>
            ) : (
              <SortableContext
                items={selectedTools}
                strategy={verticalListSortingStrategy}>
                {selectedTools.map((toolId) => {
                  const tool = allTools.find((t) => t.id === toolId)
                  return tool ? (
                    <SortableToolCard
                      key={toolId}
                      id={toolId}
                      name={tool.name}
                      onClick={() => removeTool(toolId)}
                    />
                  ) : null
                })}
              </SortableContext>
            )}
          </div>
        </div>
      </div>

      {/* 拖曳重疊層 */}
      <DragOverlay>
        {activeTool ? <DragOverlayCard name={activeTool.name} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

export default ToolSelector
