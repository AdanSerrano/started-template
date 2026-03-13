'use client'

import { useState, useCallback, useRef } from 'react'
import type { ColumnResizingConfig, ColumnSizingState } from '../types'

interface UseColumnResizingProps {
  enabled: boolean
  config?: ColumnResizingConfig | undefined
  onColumnSizingChange?: ((sizing: ColumnSizingState) => void) | undefined
}

export function useColumnResizing({
  enabled,
  config,
  onColumnSizingChange,
}: UseColumnResizingProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const minWidth = config?.minColumnWidth ?? 50
  const maxWidth = config?.maxColumnWidth ?? 500

  const columnSizing = config?.columnSizing
  const getColumnWidth = useCallback(
    (columnId: string, defaultWidth: number = 150): number => {
      if (!columnSizing) return defaultWidth
      return columnSizing[columnId] ?? defaultWidth
    },
    [columnSizing],
  )

  const startResizing = useCallback(
    (columnId: string, event: React.MouseEvent) => {
      if (!enabled || !config?.enabled) return

      event.preventDefault()
      event.stopPropagation()

      setIsResizing(true)
      setResizingColumnId(columnId)
      startX.current = event.clientX
      startWidth.current = getColumnWidth(columnId)

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX.current
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, startWidth.current + delta),
        )

        const newSizing = {
          ...(config?.columnSizing ?? {}),
          [columnId]: newWidth,
        }

        onColumnSizingChange?.(newSizing)
        config?.onColumnSizingChange?.(newSizing)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        setResizingColumnId(null)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [enabled, config, getColumnWidth, minWidth, maxWidth, onColumnSizingChange],
  )

  const resetColumnSize = useCallback(
    (columnId: string) => {
      if (!config?.columnSizing) return

      const newSizing = { ...config.columnSizing }
      delete newSizing[columnId]

      onColumnSizingChange?.(newSizing)
      config?.onColumnSizingChange?.(newSizing)
    },
    [config, onColumnSizingChange],
  )

  const resetAllSizes = useCallback(() => {
    onColumnSizingChange?.({})
    config?.onColumnSizingChange?.({})
  }, [config, onColumnSizingChange])

  return {
    isResizing,
    resizingColumnId,
    getColumnWidth,
    startResizing,
    resetColumnSize,
    resetAllSizes,
  }
}
