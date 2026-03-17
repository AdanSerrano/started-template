import type {
  SortingState,
  PaginationState,
  ColumnVisibilityState,
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
  canSelect?: ((row: TData) => boolean) | undefined
}

// ============================================
// EXPANSION CONFIG
// ============================================

export interface ExpansionConfig<TData> {
  enabled: boolean
  expandedRows: Record<string, boolean>
  onExpansionChange: (expansion: Record<string, boolean>) => void
  renderContent: (row: TData) => import('react').ReactNode
  expandOnClick?: boolean | undefined
  canExpand?: ((row: TData) => boolean) | undefined
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
  showPageNumbers?: boolean | undefined
  showFirstLast?: boolean | undefined
  showRowsInfo?: boolean | undefined
  showSelectedInfo?: boolean | undefined
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
  debounceMs?: number | undefined
  showClearButton?: boolean | undefined
}

// ============================================
// COLUMN VISIBILITY CONFIG
// ============================================

export interface ColumnVisibilityConfig {
  enabled: boolean
  columnVisibility: ColumnVisibilityState
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void
  alwaysVisibleColumns?: string[] | undefined
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
  showColumnBorders?: boolean | undefined
}

// Re-export extended types
export type {
  ColumnResizingConfig,
  VirtualizationConfig,
  KeyboardNavigationConfig,
  ColumnPinningConfig,
  PersistenceConfig,
  CopyConfig,
  PrintConfig,
  FullscreenConfig,
  ExportConfig,
  LoadingConfig,
  EmptyStateConfig,
  ToolbarConfig,
} from './types-config-extended'
