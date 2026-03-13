// Main components
export { CustomDataTable } from './custom-datatable'
export { SmartDataTable } from './smart-datatable'
export type { SmartDataTableProps, SmartDataTableRef } from './smart-datatable'

// Sub-components (for custom compositions)
export { CustomTableHeader } from './components/table-header'
export { CustomTableBody } from './components/table-body'
export { CustomTableRow } from './components/table-row'
export { CustomTablePagination } from './components/table-pagination'
export { CustomTableToolbar } from './components/table-toolbar'

// Hooks (for custom implementations)
export { useDataTableState } from './hooks/use-datatable-state'
export { useFullscreen } from './hooks/use-fullscreen'
export { useColumnResizing } from './hooks/use-column-resizing'
export { useVirtualization } from './hooks/use-virtualization'
export { useKeyboardNavigation } from './hooks/use-keyboard-navigation'
export { usePersistence } from './hooks/use-persistence'
export { useColumnPinning } from './hooks/use-column-pinning'
export { useCopyClipboard } from './hooks/use-copy-clipboard'
export { usePrint } from './hooks/use-print'
export { useAbortController } from './hooks/use-abort-controller'
export { usePrefetch, usePaginationPrefetch } from './hooks/use-prefetch'
export { useSafeTransition } from './hooks/use-safe-transition'
export { useTableSearchParams } from './hooks/use-table-search-params'

// Store (for accessing state from cell components)
export { useDataTableStore, useDataTableStoreApi } from './store'
export type {
  DataTableFetchParams,
  DataTableFetchResult,
  DataTableFetchFn,
  DataTableStore,
  DataTableStoreConfig,
} from './store'

// Types
export type {
  CustomColumnDef,
  CustomDataTableProps,
  CustomDataTableRef,
  SelectionConfig,
  ExpansionConfig,
  PaginationConfig,
  SortingConfig,
  FilterConfig,
  StyleConfig,
  ExportConfig,
  SortingState,
  PaginationState,
  ColumnVisibilityConfig,
  ColumnVisibilityState,
  ColumnResizingConfig,
  ColumnSizingState,
  ColumnPinningConfig,
  VirtualizationConfig,
  KeyboardNavigationConfig,
  PersistenceConfig,
  CopyConfig,
  PrintConfig,
  FullscreenConfig,
  ToolbarConfig,
  LoadingConfig,
  EmptyStateConfig,
  DensityType,
  ExportFormat,
} from './types'
