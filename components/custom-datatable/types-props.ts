import type { ReactNode } from 'react'

import type {
  CustomColumnDef,
  SortingState,
  ColumnVisibilityState,
  ExportFormat,
} from './types-columns'
import type {
  SelectionConfig,
  ExpansionConfig,
  PaginationConfig,
  SortingConfig,
  FilterConfig,
  ColumnVisibilityConfig,
  ColumnResizingConfig,
  ColumnPinningConfig,
  VirtualizationConfig,
  KeyboardNavigationConfig,
  PersistenceConfig,
  CopyConfig,
  PrintConfig,
  FullscreenConfig,
  StyleConfig,
  ExportConfig,
  LoadingConfig,
  EmptyStateConfig,
  ToolbarConfig,
} from './types-config'

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
