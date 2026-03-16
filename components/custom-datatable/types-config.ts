import type { ReactNode } from 'react'

import type {
  SortingState,
  PaginationState,
  ColumnVisibilityState,
  ColumnSizingState,
  ExportFormat,
} from './types-columns'

// ============================================
// SELECTION CONFIG
// ============================================

export interface SelectionConfig<TData> {
  enabled: boolean
  mode?: 'single' | 'multiple' | undefined
  showCheckbox?: boolean | undefined
  selectedRows: Record<string, boolean>
  onSelectionChange: (selection: Record<string, boolean>) => void
  onRowSelect?: ((row: TData) => void) | undefined
  selectOnRowClick?: boolean | undefined
  // Disable selection for specific rows
  canSelect?: ((row: TData) => boolean) | undefined
}

// ============================================
// EXPANSION CONFIG
// ============================================

export interface ExpansionConfig<TData> {
  enabled: boolean
  expandedRows: Record<string, boolean>
  onExpansionChange: (expansion: Record<string, boolean>) => void
  renderContent: (row: TData) => ReactNode
  expandOnClick?: boolean | undefined
  canExpand?: ((row: TData) => boolean) | undefined
  // Expand all by default
  expandAllByDefault?: boolean | undefined
}

// ============================================
// PAGINATION CONFIG
// ============================================

export interface PaginationConfig {
  pageIndex: number
  pageSize: number
  totalRows: number
  totalPages: number
  pageSizeOptions?: number[] | undefined
  onPaginationChange: (pagination: PaginationState) => void
  // Display options
  showPageNumbers?: boolean | undefined
  showFirstLast?: boolean | undefined
  showRowsInfo?: boolean | undefined
  showSelectedInfo?: boolean | undefined
  // Texts
  rowsInfoText?:
    | ((start: number, end: number, total: number) => string)
    | undefined
  selectedInfoText?: ((count: number, total: number) => string) | undefined
}

// ============================================
// SORTING CONFIG
// ============================================

export interface SortingConfig {
  sorting: SortingState[]
  onSortingChange: (sorting: SortingState[]) => void
  manualSorting?: boolean | undefined
  enableMultiSort?: boolean | undefined
  maxMultiSortColCount?: number | undefined
}

// ============================================
// FILTER CONFIG
// ============================================

export interface FilterConfig {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  placeholder?: string | undefined
  filterFn?: (<T>(row: T, filter: string) => boolean) | undefined
  // Debounce
  debounceMs?: number | undefined
  // Show clear button
  showClearButton?: boolean | undefined
}

// ============================================
// COLUMN VISIBILITY CONFIG
// ============================================

export interface ColumnVisibilityConfig {
  enabled: boolean
  columnVisibility: ColumnVisibilityState
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void
  // Columns that cannot be hidden
  alwaysVisibleColumns?: string[] | undefined
}

// ============================================
// COLUMN RESIZING CONFIG
// ============================================

export interface ColumnResizingConfig {
  enabled: boolean
  columnSizing: ColumnSizingState
  onColumnSizingChange: (sizing: ColumnSizingState) => void
  minColumnWidth?: number | undefined
  maxColumnWidth?: number | undefined
}

// ============================================
// VIRTUALIZATION CONFIG
// ============================================

export interface VirtualizationConfig {
  enabled: boolean
  rowHeight?: number | undefined
  overscan?: number | undefined
}

// ============================================
// KEYBOARD NAVIGATION CONFIG
// ============================================

export interface KeyboardNavigationConfig {
  enabled: boolean
  onEnter?: ((row: unknown, rowIndex: number) => void) | undefined
  onEscape?: (() => void) | undefined
  onDelete?: ((row: unknown, rowIndex: number) => void) | undefined
  enableCellNavigation?: boolean | undefined
}

// ============================================
// COLUMN PINNING CONFIG
// ============================================

export interface ColumnPinningConfig {
  enabled: boolean
  leftPinnedColumns?: string[] | undefined
  rightPinnedColumns?: string[] | undefined
  onPinningChange?:
    | ((pinning: { left: string[]; right: string[] }) => void)
    | undefined
}

// ============================================
// PERSISTENCE CONFIG
// ============================================

export interface PersistenceConfig {
  enabled: boolean
  key: string
  include?:
    | (
        | 'columnVisibility'
        | 'sorting'
        | 'density'
        | 'pageSize'
        | 'columnSizing'
        | 'columnPinning'
      )[]
    | undefined
  storage?: 'localStorage' | 'sessionStorage' | undefined
}

// ============================================
// COPY CONFIG
// ============================================

export interface CopyConfig {
  enabled: boolean
  format?: 'text' | 'csv' | 'json' | undefined
  includeHeaders?: boolean | undefined
  onCopy?: ((data: string) => void) | undefined
}

// ============================================
// PRINT CONFIG
// ============================================

export interface PrintConfig {
  enabled: boolean
  title?: string | undefined
  showLogo?: boolean | undefined
  pageSize?: 'A4' | 'Letter' | 'Legal' | undefined
  orientation?: 'portrait' | 'landscape' | undefined
}

// ============================================
// FULLSCREEN CONFIG
// ============================================

export interface FullscreenConfig {
  enabled: boolean
  onFullscreenChange?: ((isFullscreen: boolean) => void) | undefined
}

// ============================================
// STYLE CONFIG
// ============================================

export interface StyleConfig {
  striped?: boolean | undefined
  hover?: boolean | undefined
  stickyHeader?: boolean | undefined
  stickyFooter?: boolean | undefined
  density?: 'compact' | 'default' | 'comfortable' | undefined
  borderStyle?:
    | 'default'
    | 'none'
    | 'horizontal'
    | 'vertical'
    | 'all'
    | undefined
  maxHeight?: number | undefined
  minHeight?: number | undefined
  rounded?: boolean | undefined
  // Column borders
  showColumnBorders?: boolean | undefined
}

// ============================================
// EXPORT CONFIG
// ============================================

export interface ExportConfig<TData> {
  enabled: boolean
  formats?: ExportFormat[] | undefined
  filename?: string | undefined
  onExport?: ((format: ExportFormat, data: TData[]) => void) | undefined
  // Export options
  exportAllData?: boolean | undefined // Export all data or just visible
  includeHeaders?: boolean | undefined
}

// ============================================
// LOADING & EMPTY STATES
// ============================================

export interface LoadingConfig {
  isLoading?: boolean | undefined
  isPending?: boolean | undefined
  loadingText?: string | undefined
  loadingOverlay?: ReactNode | undefined
  showSkeletons?: boolean | undefined
  skeletonCount?: number | undefined
}

export interface EmptyStateConfig {
  message?: string | undefined
  description?: string | undefined
  icon?: ReactNode | undefined
  action?: ReactNode | undefined
  customContent?: ReactNode | undefined
}

// ============================================
// TOOLBAR CONFIG
// ============================================

export interface ToolbarConfig {
  show?: boolean | undefined
  showSearch?: boolean | undefined
  showExport?: boolean | undefined
  showColumnVisibility?: boolean | undefined
  showDensityToggle?: boolean | undefined
  showRefresh?: boolean | undefined
  showFullscreen?: boolean | undefined
  showCopy?: boolean | undefined
  showPrint?: boolean | undefined
  onRefresh?: (() => void) | undefined
  customStart?: ReactNode | undefined
  customEnd?: ReactNode | undefined
}
