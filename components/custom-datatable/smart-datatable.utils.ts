import type { DataTableStore, DataTableFetchFn } from './store/types'
import type {
  CustomDataTableProps,
  SelectionConfig,
  ExpansionConfig,
  PaginationConfig,
  SortingConfig,
  FilterConfig,
  ColumnVisibilityConfig,
  PaginationState,
  SortingState,
  ColumnVisibilityState,
  DensityType,
} from './types'
import type { StoreApi } from 'zustand'

// ============================================
// SMART CONFIG TYPES (without state management)
// ============================================

export type SmartSelectionConfig<TData> = Omit<
  SelectionConfig<TData>,
  'selectedRows' | 'onSelectionChange'
>
export type SmartExpansionConfig<TData> = Omit<
  ExpansionConfig<TData>,
  'expandedRows' | 'onExpansionChange'
>
export type SmartPaginationConfig = Omit<
  PaginationConfig,
  'pageIndex' | 'pageSize' | 'totalRows' | 'totalPages' | 'onPaginationChange'
>
export type SmartSortingConfig = Omit<
  SortingConfig,
  'sorting' | 'onSortingChange'
>
export type SmartFilterConfig = Omit<
  FilterConfig,
  'globalFilter' | 'onGlobalFilterChange'
>
export type SmartCVConfig = Omit<
  ColumnVisibilityConfig,
  'columnVisibility' | 'onColumnVisibilityChange'
>

// ============================================
// SEARCH PARAMS HELPERS
// ============================================

export function parseSearchParams(
  searchParams: URLSearchParams,
  defaultPageSize: number,
) {
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || defaultPageSize
  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? ''
  const order = searchParams.get('order') ?? ''

  return {
    pageIndex: Math.max(0, page - 1),
    pageSize: size,
    filter: q,
    sorting: sort ? [{ id: sort, desc: order === 'desc' }] : undefined,
  }
}

// ============================================
// CONFIG BUILDERS
// ============================================

export function buildSelectionConfig<TData>(
  config: SmartSelectionConfig<TData> | undefined,
  selectedRows: Record<string, boolean>,
  onSelectionChange: (s: Record<string, boolean>) => void,
): SelectionConfig<TData> | undefined {
  if (!config?.enabled) return undefined
  return {
    ...config,
    selectedRows,
    onSelectionChange,
  } as SelectionConfig<TData>
}

export function buildExpansionConfig<TData>(
  config: SmartExpansionConfig<TData> | undefined,
  expandedRows: Record<string, boolean>,
  onExpansionChange: (e: Record<string, boolean>) => void,
): ExpansionConfig<TData> | undefined {
  if (!config?.enabled) return undefined
  return {
    ...config,
    expandedRows,
    onExpansionChange,
  } as ExpansionConfig<TData>
}

export function buildPaginationConfig(
  config: SmartPaginationConfig | undefined,
  pageIndex: number,
  pageSize: number,
  totalRows: number,
  totalPages: number,
  onPaginationChange: (p: PaginationState) => void,
): PaginationConfig {
  return {
    ...config,
    pageIndex,
    pageSize,
    totalRows,
    totalPages,
    onPaginationChange,
  }
}

export function buildSortingConfig(
  config: SmartSortingConfig | undefined,
  sorting: SortingState[],
  onSortingChange: (s: SortingState[]) => void,
): SortingConfig {
  return {
    ...config,
    sorting,
    onSortingChange,
    manualSorting: true,
  }
}

export function buildFilterConfig(
  config: SmartFilterConfig | undefined,
  globalFilter: string,
  onGlobalFilterChange: (f: string) => void,
): FilterConfig | undefined {
  if (!config) return undefined
  return {
    ...config,
    globalFilter,
    onGlobalFilterChange,
  } as FilterConfig
}

export function buildCVConfig(
  config: SmartCVConfig | undefined,
  columnVisibility: ColumnVisibilityState,
  onColumnVisibilityChange: (cv: ColumnVisibilityState) => void,
): ColumnVisibilityConfig | undefined {
  if (!config?.enabled) return undefined
  return {
    ...config,
    columnVisibility,
    onColumnVisibilityChange,
  } as ColumnVisibilityConfig
}

// ============================================
// SEARCH PARAMS SYNC
// ============================================

export function subscribeToSearchParamsSync<TData>(
  store: StoreApi<DataTableStore<TData>>,
  defaultPageSize: number,
  pathname: string,
  prevRef: React.RefObject<string>,
) {
  return store.subscribe((state) => {
    const params = new URLSearchParams()

    if (state.pageIndex > 0) {
      params.set('page', String(state.pageIndex + 1))
    }
    if (state.pageSize !== defaultPageSize) {
      params.set('size', String(state.pageSize))
    }
    if (state.globalFilter) {
      params.set('q', state.globalFilter)
    }
    const firstSort = state.sorting[0]
    if (firstSort) {
      params.set('sort', firstSort.id)
      if (firstSort.desc) {
        params.set('order', 'desc')
      }
    }

    const qs = params.toString()
    if (qs === prevRef.current) return
    prevRef.current = qs

    const url = qs ? `${pathname}?${qs}` : pathname
    window.history.replaceState(null, '', url)
  })
}

export function buildMergedStyle(
  style: { density?: DensityType | undefined } | undefined,
  initialDensity: DensityType | undefined,
) {
  return { ...style, density: initialDensity ?? style?.density }
}

// ============================================
// SMART DATATABLE PROPS & REF TYPES
// ============================================

export interface SmartDataTableProps<TData> extends Omit<
  CustomDataTableProps<TData>,
  | 'data'
  | 'selection'
  | 'expansion'
  | 'pagination'
  | 'sorting'
  | 'filter'
  | 'columnVisibility'
  | 'isLoading'
  | 'isPending'
> {
  fetchFn: DataTableFetchFn<TData>
  initialPageIndex?: number
  initialPageSize?: number
  initialSorting?: SortingState[]
  initialFilter?: string
  initialColumnVisibility?: ColumnVisibilityState
  initialDensity?: DensityType
  initialData?: TData[] | undefined
  initialTotalRows?: number | undefined
  selection?: SmartSelectionConfig<TData>
  expansion?: SmartExpansionConfig<TData>
  pagination?: SmartPaginationConfig
  sorting?: SmartSortingConfig
  filter?: SmartFilterConfig
  columnVisibility?: SmartCVConfig
  syncSearchParams?: boolean | undefined
}

export interface SmartDataTableRef<TData> {
  updateRow: (rowId: string, updater: Partial<TData>) => void
  removeRow: (rowId: string) => void
  refetch: () => Promise<void>
  silentRefetch: () => Promise<void>
  resetAndRefetch: () => Promise<void>
}
