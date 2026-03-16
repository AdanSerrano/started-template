import type { ReactNode } from 'react'

// ============================================
// COLUMN DEFINITION
// ============================================

export interface CustomColumnDef<TData> {
  id: string
  accessorKey?: keyof TData | undefined
  header:
    | string
    | ReactNode
    | ((props: {
        sortDirection?: 'asc' | 'desc' | false | undefined
      }) => ReactNode)
  cell: (props: {
    row: TData
    rowIndex: number
    isSelected: boolean
    isExpanded: boolean
  }) => ReactNode
  // Sorting
  enableSorting?: boolean | undefined
  sortingFn?: ((a: TData, b: TData) => number) | undefined
  // Visibility
  enableHiding?: boolean | undefined
  defaultHidden?: boolean | undefined
  // Sizing
  width?: number | string | undefined
  minWidth?: number | undefined
  maxWidth?: number | undefined
  // Resizing
  enableResizing?: boolean | undefined
  // Alignment
  align?: 'left' | 'center' | 'right' | undefined
  // Pinning
  pinned?: 'left' | 'right' | false | undefined
  // Custom classes
  headerClassName?: string | undefined
  cellClassName?: string | undefined
  // Footer
  footer?: string | ReactNode | undefined
}

// ============================================
// STATE TYPES
// ============================================

export interface SortingState {
  id: string
  desc: boolean
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export type ColumnVisibilityState = Record<string, boolean>
export type ColumnSizingState = Record<string, number>

// ============================================
// UTILITY TYPES
// ============================================

export type DensityType = 'compact' | 'default' | 'comfortable'
export type AlignType = 'left' | 'center' | 'right'
export type PinnedType = 'left' | 'right' | false
export type ExportFormat = 'csv' | 'json' | 'xlsx'
export type BorderStyleType =
  | 'default'
  | 'none'
  | 'horizontal'
  | 'vertical'
  | 'all'

// Density configurations
export const DENSITY_CONFIG = {
  compact: { rowHeight: 'h-8', padding: 'py-1 px-2', fontSize: 'text-xs' },
  default: { rowHeight: 'h-12', padding: 'py-2 px-3', fontSize: 'text-sm' },
  comfortable: {
    rowHeight: 'h-16',
    padding: 'py-3 px-4',
    fontSize: 'text-base',
  },
} as const

// Export format icons mapping
export const EXPORT_ICONS = {
  csv: 'FileText',
  json: 'FileJson',
  xlsx: 'FileSpreadsheet',
} as const
