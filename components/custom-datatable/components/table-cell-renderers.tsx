'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type {
  CustomColumnDef,
  SelectionConfig,
  ExpansionConfig,
} from '../types'

export interface CellStyleData {
  columnId: string
  alignClass: string
  pinnedClass: string
  cellClassName: string | undefined
  cellStyle: React.CSSProperties
  cellFn: CustomColumnDef<unknown>['cell']
}

export function useComputedCellStyles<TData>(
  columns: CustomColumnDef<TData>[],
) {
  return useMemo(() => {
    return columns.map((column) => {
      const cellStyle: React.CSSProperties = {}
      if (column.width) {
        cellStyle.width =
          typeof column.width === 'number' ? `${column.width}px` : column.width
      }
      if (column.minWidth) cellStyle.minWidth = `${column.minWidth}px`
      if (column.maxWidth) cellStyle.maxWidth = `${column.maxWidth}px`

      const alignClass =
        column.align === 'center'
          ? 'text-center'
          : column.align === 'right'
            ? 'text-right'
            : 'text-left'

      const pinnedClass = column.pinned
        ? cn(
            'sticky z-10 bg-background will-change-transform',
            column.pinned === 'left'
              ? 'left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
              : 'right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
          )
        : ''

      return {
        columnId: column.id,
        alignClass,
        pinnedClass,
        cellClassName: column.cellClassName,
        cellStyle,
        cellFn: column.cell,
      }
    })
  }, [columns])
}

export function computeExpandedColSpan<TData>(
  columnsLength: number,
  selection: SelectionConfig<TData> | undefined,
  expansion: ExpansionConfig<TData> | undefined,
): number {
  return (
    columnsLength +
    (selection?.enabled && selection.showCheckbox ? 1 : 0) +
    (expansion?.enabled ? 1 : 0)
  )
}
