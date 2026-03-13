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

// ============================================
// MAIN DATATABLE PROPS
// ============================================

export interface CustomDataTableProps<TData> {
  // Data
  data: TData[]
  columns: CustomColumnDef<TData>[]
  getRowId: (row: TData) => string

  // Core Features
  selection?: SelectionConfig<TData> | undefined
  expansion?: ExpansionConfig<TData> | undefined
  pagination?: PaginationConfig | undefined
  sorting?: SortingConfig | undefined
  filter?: FilterConfig | undefined

  // Advanced Features
  columnVisibility?: ColumnVisibilityConfig | undefined
  columnResizing?: ColumnResizingConfig | undefined
  columnPinning?: ColumnPinningConfig | undefined
  virtualization?: VirtualizationConfig | undefined
  keyboardNavigation?: KeyboardNavigationConfig | undefined
  persistence?: PersistenceConfig | undefined
  copy?: CopyConfig | undefined
  print?: PrintConfig | undefined
  fullscreen?: FullscreenConfig | undefined

  // Appearance
  style?: StyleConfig | undefined

  // Export
  export?: ExportConfig<TData> | undefined

  // Loading states
  isLoading?: boolean | undefined
  isPending?: boolean | undefined
  loadingConfig?: LoadingConfig | undefined

  // Empty state
  emptyMessage?: string | undefined
  emptyIcon?: ReactNode | undefined
  emptyState?: EmptyStateConfig | undefined

  // Row Events
  onRowClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowDoubleClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowContextMenu?: ((row: TData, event: React.MouseEvent) => void) | undefined

  // Custom Slots
  toolbar?: ReactNode | undefined
  toolbarConfig?: ToolbarConfig | undefined
  headerActions?: ReactNode | undefined
  bulkActions?: ((selectedRows: TData[]) => ReactNode) | undefined
  footer?: ReactNode | undefined
  caption?: ReactNode | undefined

  // Classes
  className?: string | undefined
  containerClassName?: string | undefined
  headerClassName?: string | undefined
  bodyClassName?: string | undefined
  footerClassName?: string | undefined
  rowClassName?: string | ((row: TData, index: number) => string) | undefined
  toolbarClassName?: string | undefined
  paginationClassName?: string | undefined

  // Accessibility
  ariaLabel?: string | undefined
  ariaDescribedBy?: string | undefined
}

// ============================================
// REF METHODS
// ============================================

export interface CustomDataTableRef<TData> {
  // Navigation
  scrollToRow: (index: number) => void
  scrollToTop: () => void
  scrollToBottom: () => void

  // Export
  exportData: (format: ExportFormat) => void

  // Filters
  resetFilters: () => void
  setGlobalFilter: (filter: string) => void

  // Sorting
  resetSorting: () => void
  setSorting: (sorting: SortingState[]) => void

  // Selection
  selectAll: () => void
  clearSelection: () => void
  selectRows: (rowIds: string[]) => void
  toggleRowSelection: (rowId: string) => void
  getSelectedRows: () => TData[]
  getSelectedRowIds: () => string[]

  // Expansion
  expandAll: () => void
  collapseAll: () => void
  expandRows: (rowIds: string[]) => void
  toggleRowExpansion: (rowId: string) => void

  // Column visibility
  setColumnVisibility: (visibility: ColumnVisibilityState) => void
  toggleColumnVisibility: (columnId: string) => void
  showAllColumns: () => void
  hideColumn: (columnId: string) => void
  getVisibleColumns: () => string[]

  // Pagination
  goToPage: (page: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void

  // Data access
  getVisibleData: () => TData[]
  getFilteredData: () => TData[]
  getAllData: () => TData[]
  getRowById: (id: string) => TData | undefined

  // Focus management
  focusTable: () => void
  focusRow: (index: number) => void
}

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
