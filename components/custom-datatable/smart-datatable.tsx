'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useStore, type StoreApi } from 'zustand'
import { useSearchParams } from 'next/navigation'
import { usePathname } from '@/i18n/navigation'
import { CustomDataTable } from './custom-datatable'
import { DataTableStoreContext } from './store/datatable-context'
import { createDataTableStore } from './store/create-datatable-store'
import type {
  CustomDataTableProps,
  SelectionConfig,
  ExpansionConfig,
  PaginationConfig,
  PaginationState,
  SortingConfig,
  SortingState,
  FilterConfig,
  ColumnVisibilityConfig,
  ColumnVisibilityState,
  DensityType,
} from './types'
import type { DataTableStore, DataTableFetchFn } from './store/types'

// ============================================
// SMART CONFIG TYPES (without state management)
// ============================================

type SmartSelectionConfig<TData> = Omit<
  SelectionConfig<TData>,
  'selectedRows' | 'onSelectionChange'
>
type SmartExpansionConfig<TData> = Omit<
  ExpansionConfig<TData>,
  'expandedRows' | 'onExpansionChange'
>
type SmartPaginationConfig = Omit<
  PaginationConfig,
  'pageIndex' | 'pageSize' | 'totalRows' | 'totalPages' | 'onPaginationChange'
>
type SmartSortingConfig = Omit<SortingConfig, 'sorting' | 'onSortingChange'>
type SmartFilterConfig = Omit<
  FilterConfig,
  'globalFilter' | 'onGlobalFilterChange'
>
type SmartCVConfig = Omit<
  ColumnVisibilityConfig,
  'columnVisibility' | 'onColumnVisibilityChange'
>

// ============================================
// SEARCH PARAMS HELPERS
// ============================================

function parseSearchParams(
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
// PROPS & REF
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

// ============================================
// SEARCH PARAMS SYNC HOOK
// ============================================

function useSearchParamsSync<TData>(
  store: StoreApi<DataTableStore<TData>>,
  defaultPageSize: number,
  enabled: boolean,
) {
  const pathname = usePathname()
  const prevRef = useRef('')

  useEffect(() => {
    if (!enabled) return

    const unsub = store.subscribe((state) => {
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

    return unsub
  }, [store, pathname, defaultPageSize, enabled])
}

// ============================================
// COMPONENT
// ============================================

function SmartDataTableInner<TData>(
  props: SmartDataTableProps<TData>,
  ref: React.ForwardedRef<SmartDataTableRef<TData>>,
) {
  const {
    columns,
    getRowId,
    fetchFn,
    initialPageIndex,
    initialPageSize = 10,
    initialSorting,
    initialFilter,
    initialColumnVisibility,
    initialDensity,
    initialData,
    initialTotalRows,
    selection: selectionConfig,
    expansion: expansionConfig,
    pagination: paginationConfig,
    sorting: sortingConfig,
    filter: filterConfig,
    columnVisibility: cvConfig,
    toolbarConfig: passthroughToolbarConfig,
    style,
    syncSearchParams: syncEnabled = false,
    ...passthroughProps
  } = props

  // Read URL search params for initial state (only when syncSearchParams is enabled)
  const searchParams = useSearchParams()
  const spInit = useMemo(() => {
    if (!syncEnabled) return null
    return parseSearchParams(searchParams, initialPageSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- read once on mount

  // Resolved initial values (URL params override props when sync is enabled)
  const resolvedPageIndex = spInit?.pageIndex ?? initialPageIndex
  const resolvedPageSize = spInit?.pageSize ?? initialPageSize
  const resolvedFilter = spInit?.filter || initialFilter
  const resolvedSorting = spInit?.sorting ?? initialSorting

  // Keep fetchFn/getRowId current via refs (accessed only in effects/callbacks, never during render)
  const fetchFnRef = useRef(fetchFn)
  const getRowIdRef = useRef(getRowId)
  useEffect(() => {
    fetchFnRef.current = fetchFn
    getRowIdRef.current = getRowId
  }, [fetchFn, getRowId])

  // Create store once — store callbacks read refs lazily (not during render)
  // eslint-disable-next-line react-hooks/refs
  const [store] = useState<StoreApi<DataTableStore<TData>>>(() =>
    createDataTableStore<TData>({
      fetchFn: (params) => fetchFnRef.current(params),
      getRowId: (row) => getRowIdRef.current(row),
      initialPageIndex: resolvedPageIndex,
      initialPageSize: resolvedPageSize,
      initialSorting: resolvedSorting,
      initialFilter: resolvedFilter,
      initialColumnVisibility,
      initialData,
      initialTotalRows,
    }),
  )

  // Sync store state → URL search params
  useSearchParamsSync(store, initialPageSize, syncEnabled)

  // Subscribe to store state
  const state = useStore(store)

  // Expose ref methods
  useImperativeHandle(
    ref,
    () => ({
      updateRow: (id, u) => store.getState().updateRow(id, u),
      removeRow: (id) => store.getState().removeRow(id),
      refetch: () => store.getState().refetch(),
      silentRefetch: () => store.getState().silentRefetch(),
      resetAndRefetch: () => store.getState().resetAndRefetch(),
    }),
    [store],
  )

  // Fetch initial data (ref guard prevents Strict Mode double-invoke)
  const fetchGuard = useRef(false)
  useEffect(() => {
    if (fetchGuard.current) return
    fetchGuard.current = true
    store.getState().fetchData()
  }, [store])

  // Stable callbacks via store.getState() to avoid stale closures
  const onSelectionChange = useCallback(
    (s: Record<string, boolean>) => store.getState().setSelectedRows(s),
    [store],
  )
  const onExpansionChange = useCallback(
    (e: Record<string, boolean>) => store.getState().setExpandedRows(e),
    [store],
  )
  const onSortingChange = useCallback(
    (s: SortingState[]) => store.getState().setSorting(s),
    [store],
  )
  const onFilterChange = useCallback(
    (f: string) => store.getState().setGlobalFilter(f),
    [store],
  )
  const onPaginationChange = useCallback(
    (p: PaginationState) => {
      const cur = store.getState()
      if (p.pageSize !== cur.pageSize) cur.setPageSize(p.pageSize)
      else cur.setPageIndex(p.pageIndex)
    },
    [store],
  )
  const onCVChange = useCallback(
    (cv: ColumnVisibilityState) => store.getState().setColumnVisibility(cv),
    [store],
  )
  const onRefresh = useCallback(() => store.getState().refetch(), [store])

  // Build config objects for CustomDataTable
  const fullSelection = useMemo(
    () =>
      selectionConfig?.enabled
        ? ({
            ...selectionConfig,
            selectedRows: state.selectedRows,
            onSelectionChange,
          } as SelectionConfig<TData>)
        : undefined,
    [selectionConfig, state.selectedRows, onSelectionChange],
  )

  const fullExpansion = useMemo(
    () =>
      expansionConfig?.enabled
        ? ({
            ...expansionConfig,
            expandedRows: state.expandedRows,
            onExpansionChange,
          } as ExpansionConfig<TData>)
        : undefined,
    [expansionConfig, state.expandedRows, onExpansionChange],
  )

  const totalPages = Math.ceil(state.totalRows / state.pageSize) || 1
  const fullPagination = useMemo<PaginationConfig>(
    () => ({
      ...paginationConfig,
      pageIndex: state.pageIndex,
      pageSize: state.pageSize,
      totalRows: state.totalRows,
      totalPages,
      onPaginationChange,
    }),
    [
      paginationConfig,
      state.pageIndex,
      state.pageSize,
      state.totalRows,
      totalPages,
      onPaginationChange,
    ],
  )

  const fullSorting = useMemo<SortingConfig>(
    () => ({
      ...sortingConfig,
      sorting: state.sorting,
      onSortingChange,
      manualSorting: true, // Server-side sorting
    }),
    [sortingConfig, state.sorting, onSortingChange],
  )

  const fullFilter = useMemo(() => {
    if (!filterConfig) return undefined
    return {
      ...filterConfig,
      globalFilter: state.globalFilter,
      onGlobalFilterChange: onFilterChange,
    } as FilterConfig
  }, [filterConfig, state.globalFilter, onFilterChange])

  const fullCV = useMemo(() => {
    if (!cvConfig?.enabled) return undefined
    return {
      ...cvConfig,
      columnVisibility: state.columnVisibility,
      onColumnVisibilityChange: onCVChange,
    } as ColumnVisibilityConfig
  }, [cvConfig, state.columnVisibility, onCVChange])

  const mergedToolbar = useMemo(
    () => ({
      showRefresh: true,
      ...passthroughToolbarConfig,
      onRefresh,
    }),
    [passthroughToolbarConfig, onRefresh],
  )

  const mergedStyle = useMemo(
    () => ({ ...style, density: initialDensity ?? style?.density }),
    [style, initialDensity],
  )

  return (
    <DataTableStoreContext.Provider value={store}>
      <CustomDataTable
        data={state.data}
        columns={columns}
        getRowId={getRowId}
        selection={fullSelection}
        expansion={fullExpansion}
        pagination={fullPagination}
        sorting={fullSorting}
        filter={fullFilter}
        columnVisibility={fullCV}
        isLoading={state.isLoading}
        isPending={state.isPending}
        toolbarConfig={mergedToolbar}
        style={mergedStyle}
        {...passthroughProps}
      />
    </DataTableStoreContext.Provider>
  )
}

export const SmartDataTable = forwardRef(SmartDataTableInner) as <TData>(
  props: SmartDataTableProps<TData> & {
    ref?: React.ForwardedRef<SmartDataTableRef<TData>>
  },
) => React.ReactElement
