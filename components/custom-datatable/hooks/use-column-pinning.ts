'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ColumnPinningConfig, CustomColumnDef } from '../types'

interface UseColumnPinningProps<TData> {
  enabled: boolean
  config?: ColumnPinningConfig | undefined
  columns: CustomColumnDef<TData>[]
}

interface ColumnPinningState {
  left: string[]
  right: string[]
}

export function useColumnPinning<TData>({
  enabled,
  config,
  columns,
}: UseColumnPinningProps<TData>) {
  const [pinningState, setPinningState] = useState<ColumnPinningState>({
    left: config?.leftPinnedColumns ?? [],
    right: config?.rightPinnedColumns ?? [],
  })

  // Pin column to left
  const pinColumnLeft = useCallback(
    (columnId: string) => {
      if (!enabled || !config?.enabled) return

      setPinningState((prev) => {
        // Remove from right if exists
        const newRight = prev.right.filter((id) => id !== columnId)
        // Add to left if not already there
        const newLeft = prev.left.includes(columnId)
          ? prev.left
          : [...prev.left, columnId]

        const newState = { left: newLeft, right: newRight }
        config.onPinningChange?.(newState)
        return newState
      })
    },
    [enabled, config],
  )

  // Pin column to right
  const pinColumnRight = useCallback(
    (columnId: string) => {
      if (!enabled || !config?.enabled) return

      setPinningState((prev) => {
        // Remove from left if exists
        const newLeft = prev.left.filter((id) => id !== columnId)
        // Add to right if not already there
        const newRight = prev.right.includes(columnId)
          ? prev.right
          : [...prev.right, columnId]

        const newState = { left: newLeft, right: newRight }
        config.onPinningChange?.(newState)
        return newState
      })
    },
    [enabled, config],
  )

  // Unpin column
  const unpinColumn = useCallback(
    (columnId: string) => {
      if (!enabled || !config?.enabled) return

      setPinningState((prev) => {
        const newState = {
          left: prev.left.filter((id) => id !== columnId),
          right: prev.right.filter((id) => id !== columnId),
        }
        config.onPinningChange?.(newState)
        return newState
      })
    },
    [enabled, config],
  )

  // Toggle pin state
  const togglePinColumn = useCallback(
    (columnId: string, position: 'left' | 'right') => {
      const isPinned =
        position === 'left'
          ? pinningState.left.includes(columnId)
          : pinningState.right.includes(columnId)

      if (isPinned) {
        unpinColumn(columnId)
      } else if (position === 'left') {
        pinColumnLeft(columnId)
      } else {
        pinColumnRight(columnId)
      }
    },
    [pinningState, pinColumnLeft, pinColumnRight, unpinColumn],
  )

  // Get pin position of a column
  const getPinPosition = useCallback(
    (columnId: string): 'left' | 'right' | null => {
      if (pinningState.left.includes(columnId)) return 'left'
      if (pinningState.right.includes(columnId)) return 'right'
      return null
    },
    [pinningState],
  )

  // Get columns organized by pin state
  const organizedColumns = useMemo(() => {
    if (!enabled || !config?.enabled) {
      return {
        left: [] as CustomColumnDef<TData>[],
        center: columns,
        right: [] as CustomColumnDef<TData>[],
      }
    }

    const leftCols: CustomColumnDef<TData>[] = []
    const centerCols: CustomColumnDef<TData>[] = []
    const rightCols: CustomColumnDef<TData>[] = []

    // Sort left pinned columns by their order in pinningState.left
    pinningState.left.forEach((id) => {
      const col = columns.find((c) => c.id === id)
      if (col) leftCols.push(col)
    })

    // Add unpinned columns
    columns.forEach((col) => {
      if (
        !pinningState.left.includes(col.id) &&
        !pinningState.right.includes(col.id)
      ) {
        centerCols.push(col)
      }
    })

    // Sort right pinned columns by their order in pinningState.right
    pinningState.right.forEach((id) => {
      const col = columns.find((c) => c.id === id)
      if (col) rightCols.push(col)
    })

    return {
      left: leftCols,
      center: centerCols,
      right: rightCols,
    }
  }, [enabled, config?.enabled, columns, pinningState])

  // Reset all pinning
  const resetPinning = useCallback(() => {
    const newState = { left: [], right: [] }
    setPinningState(newState)
    config?.onPinningChange?.(newState)
  }, [config])

  // Set pinning state programmatically
  const setPinning = useCallback(
    (newState: ColumnPinningState) => {
      setPinningState(newState)
      config?.onPinningChange?.(newState)
    },
    [config],
  )

  // Calculate sticky positions for pinned columns
  const getStickyStyle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (columnId: string, _columnIndex: number): React.CSSProperties => {
      if (!enabled || !config?.enabled) return {}

      const position = getPinPosition(columnId)
      if (!position) return {}

      if (position === 'left') {
        const leftIndex = pinningState.left.indexOf(columnId)
        // Calculate left offset based on previous columns width (approximate)
        const leftOffset = leftIndex * 150 // Default column width
        return {
          position: 'sticky',
          left: leftOffset,
          zIndex: 10,
          backgroundColor: 'inherit',
        }
      }

      if (position === 'right') {
        const rightIndex = pinningState.right.indexOf(columnId)
        // Calculate right offset from the end
        const rightOffset = (pinningState.right.length - 1 - rightIndex) * 150
        return {
          position: 'sticky',
          right: rightOffset,
          zIndex: 10,
          backgroundColor: 'inherit',
        }
      }

      return {}
    },
    [enabled, config?.enabled, pinningState, getPinPosition],
  )

  return {
    pinningState,
    pinColumnLeft,
    pinColumnRight,
    unpinColumn,
    togglePinColumn,
    getPinPosition,
    organizedColumns,
    resetPinning,
    setPinning,
    getStickyStyle,
    isPinningEnabled: enabled && config?.enabled,
  }
}
