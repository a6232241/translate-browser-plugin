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

  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div
      ref={setNodeRef}
      className="tp-p-2.5 tp-px-3.5 tp-rounded-lg tp-border tp-border-solid tp-border-gray-200 tp-bg-white tp-shadow-sm tp-flex tp-items-center tp-justify-between tp-gap-2 tp-mb-1.5 tp-transition-all tp-duration-150 tp-cursor-grab tp-font-sans"
      style={dndStyle}
      {...attributes}
      {...listeners}>
      {/* 拖曳把手 */}
      <div className="tp-flex tp-items-center tp-gap-2.5">
        <span className="tp-text-gray-300 tp-text-sm tp-leading-none tp-cursor-grab">
          ⠿
        </span>
        <span className="tp-text-[13px] tp-font-medium tp-text-gray-700">
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
        className="tp-w-6 tp-h-6 tp-rounded tp-border-none tp-bg-transparent tp-text-gray-400 tp-text-sm tp-flex tp-items-center tp-justify-center tp-flex-shrink-0 tp-transition-all tp-duration-150 hover:tp-bg-gray-100 hover:tp-text-gray-700 tp-cursor-pointer"
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
      className="tp-p-2.5 tp-px-3.5 tp-rounded-lg tp-border tp-border-solid tp-border-gray-200 tp-bg-white tp-shadow-sm tp-flex tp-items-center tp-justify-between tp-gap-2 tp-mb-1.5 tp-transition-all tp-duration-150 tp-cursor-pointer hover:tp-bg-blue-50 hover:tp-border-blue-200 tp-font-sans">
      <span className="tp-text-[13px] tp-font-medium tp-text-gray-700">
        {name}
      </span>
      <span className="tp-text-sm tp-text-gray-400">→</span>
    </div>
  )
}

/** 拖曳中的重疊顯示卡片 */
const DragOverlayCard: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="tp-p-2.5 tp-px-3.5 tp-rounded-lg tp-border tp-border-solid tp-border-blue-500 tp-bg-blue-50 tp-flex tp-items-center tp-gap-2.5 tp-shadow-xl tp-cursor-grabbing tp-font-sans">
      <span className="tp-text-blue-500 tp-text-sm">⠿</span>
      <span className="tp-text-[13px] tp-font-bold tp-text-blue-800">
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
      <div className="tp-flex tp-gap-4 tp-min-h-[200px]">
        {/* 左欄：可選的翻譯工具 */}
        <div className="tp-flex-1">
          <h3 className="tp-text-[11px] tp-font-bold tp-text-gray-400 tp-mb-2.5 tp-uppercase tp-tracking-wider tp-font-sans">
            可選的翻譯工具
          </h3>
          <div className="tp-p-2 tp-rounded-xl tp-bg-gray-50 tp-border tp-border-dashed tp-border-gray-300 tp-min-h-[120px]">
            {availableTools.length === 0 ? (
              <div className="tp-p-5 tp-text-center tp-text-gray-400 tp-text-xs tp-font-sans">
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
        <div className="tp-flex-1">
          <h3 className="tp-text-[11px] tp-font-bold tp-text-gray-400 tp-mb-2.5 tp-uppercase tp-tracking-wider tp-font-sans">
            已選的翻譯工具
          </h3>
          <div className="tp-p-2 tp-rounded-xl tp-bg-blue-50/50 tp-border tp-border-dashed tp-border-blue-300 tp-min-h-[120px]">
            {selectedTools.length === 0 ? (
              <div className="tp-p-5 tp-text-center tp-text-gray-400 tp-text-xs tp-font-sans">
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
