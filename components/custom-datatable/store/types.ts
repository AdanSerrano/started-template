import type { SortingState, ColumnVisibilityState } from '../types'

// ============================================
// FETCH TYPES
// ============================================

export interface DataTableFetchParams {
  pageIndex: number
  pageSize: number
  sorting: SortingState[]
  globalFilter: string
}

export interface DataTableFetchResult<TData> {
  data: TData[]
  totalRows: number
}

export type DataTableFetchFn<TData> = (
  params: DataTableFetchParams,
) => Promise<DataTableFetchResult<TData>>

// ============================================
// STORE STATE & ACTIONS
// ============================================

export interface DataTableStoreState<TData> {
  data: TData[]
  totalRows: number
  pageIndex: number
  pageSize: number
  sorting: SortingState[]
  globalFilter: string
  selectedRows: Record<string, boolean>
  expandedRows: Record<string, boolean>
  columnVisibility: ColumnVisibilityState
  isLoading: boolean
  isPending: boolean
}

export interface DataTableStoreActions<TData> {
  fetchData: () => Promise<void>
  refetch: () => Promise<void>
  silentRefetch: () => Promise<void>
  resetAndRefetch: () => Promise<void>
  updateRow: (rowId: string, updater: Partial<TData>) => void
  removeRow: (rowId: string) => void
  setPageIndex: (pageIndex: number) => void
  setPageSize: (pageSize: number) => void
  setSorting: (sorting: SortingState[]) => void
  setGlobalFilter: (filter: string) => void
  setSelectedRows: (selection: Record<string, boolean>) => void
  clearSelection: () => void
  setExpandedRows: (expansion: Record<string, boolean>) => void
  setColumnVisibility: (visibility: ColumnVisibilityState) => void
}

export type DataTableStore<TData> = DataTableStoreState<TData> &
  DataTableStoreActions<TData>

// ============================================
// STORE CONFIG
// ============================================

export interface DataTableStoreConfig<TData> {
  fetchFn: DataTableFetchFn<TData>
  getRowId: (row: TData) => string
  initialPageIndex?: number | undefined
  initialPageSize?: number | undefined
  initialSorting?: SortingState[] | undefined
  initialFilter?: string | undefined
  initialColumnVisibility?: ColumnVisibilityState | undefined
  initialData?: TData[] | undefined
  initialTotalRows?: number | undefined
}
