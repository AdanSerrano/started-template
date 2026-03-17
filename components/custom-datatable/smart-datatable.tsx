'use client'

import { useSearchParams } from 'next/navigation'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useStore, type StoreApi } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { usePathname } from '@/i18n/navigation'
import { CustomDataTable } from './custom-datatable'
import { useStoreCallbacks, useSmartConfigs } from './hooks/use-smart-configs'
import {
  parseSearchParams,
  subscribeToSearchParamsSync,
} from './smart-datatable.utils'
import { createDataTableStore } from './store/create-datatable-store'
import { DataTableStoreContext } from './store/datatable-context'
import type {
  SmartDataTableProps,
  SmartDataTableRef,
} from './smart-datatable.utils'
import type { DataTableStoreState, DataTableStore } from './store/types'

export type {
  SmartDataTableProps,
  SmartDataTableRef,
} from './smart-datatable.utils'

function useSearchParamsSync<TData>(
  store: StoreApi<DataTableStore<TData>>,
  defaultPageSize: number,
  enabled: boolean,
) {
  const pathname = usePathname()
  const prevRef = useRef('')
  useEffect(() => {
    if (!enabled) return
    return subscribeToSearchParamsSync(
      store,
      defaultPageSize,
      pathname,
      prevRef,
    )
  }, [store, pathname, defaultPageSize, enabled])
}

function SmartDataTableInner<TData>(
  props: SmartDataTableProps<TData>,
  ref: React.ForwardedRef<SmartDataTableRef<TData>>,
) {
  const {
    columns,
    getRowId,
    fetchFn,
    initialPageSize = 10,
    initialPageIndex,
    initialSorting,
    initialFilter,
    initialColumnVisibility,
    initialDensity,
    initialData,
    initialTotalRows,
    selection: selCfg,
    expansion: expCfg,
    pagination: pagCfg,
    sorting: sortCfg,
    filter: filterCfg,
    columnVisibility: cvCfg,
    toolbarConfig: ptToolbarCfg,
    style,
    syncSearchParams: syncEnabled = false,
    ...passthroughProps
  } = props

  const searchParams = useSearchParams()
  const spInit = useMemo(() => {
    if (!syncEnabled) return null
    return parseSearchParams(searchParams, initialPageSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFnRef = useRef(fetchFn)
  const getRowIdRef = useRef(getRowId)
  useEffect(() => {
    fetchFnRef.current = fetchFn
    getRowIdRef.current = getRowId
  }, [fetchFn, getRowId])

  // eslint-disable-next-line react-hooks/refs
  const [store] = useState<StoreApi<DataTableStore<TData>>>(() =>
    createDataTableStore<TData>({
      fetchFn: (params) => fetchFnRef.current(params),
      getRowId: (row) => getRowIdRef.current(row),
      initialPageIndex: spInit?.pageIndex ?? initialPageIndex,
      initialPageSize: spInit?.pageSize ?? initialPageSize,
      initialSorting: spInit?.sorting ?? initialSorting,
      initialFilter: spInit?.filter || initialFilter,
      initialColumnVisibility,
      initialData,
      initialTotalRows,
    }),
  )

  useSearchParamsSync(store, initialPageSize, syncEnabled)

  const state = useStore(
    store,
    useShallow(
      (s): DataTableStoreState<TData> => ({
        data: s.data,
        totalRows: s.totalRows,
        pageIndex: s.pageIndex,
        pageSize: s.pageSize,
        sorting: s.sorting,
        globalFilter: s.globalFilter,
        selectedRows: s.selectedRows,
        expandedRows: s.expandedRows,
        columnVisibility: s.columnVisibility,
        isLoading: s.isLoading,
        isPending: s.isPending,
      }),
    ),
  )

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

  const fetchGuard = useRef(false)
  useEffect(() => {
    if (fetchGuard.current) return
    fetchGuard.current = true
    store.getState().fetchData()
  }, [store])

  const callbacks = useStoreCallbacks(store)
  const configs = useSmartConfigs({
    selCfg,
    expCfg,
    pagCfg,
    sortCfg,
    filterCfg,
    cvCfg,
    state,
    callbacks,
    ptToolbarCfg,
    style,
    initialDensity,
  })

  return (
    <DataTableStoreContext.Provider value={store}>
      <CustomDataTable
        data={state.data}
        columns={columns}
        getRowId={getRowId}
        selection={configs.selection}
        expansion={configs.expansion}
        pagination={configs.pagination}
        sorting={configs.sorting}
        filter={configs.filter}
        columnVisibility={configs.columnVisibility}
        isLoading={state.isLoading}
        isPending={state.isPending}
        toolbarConfig={configs.toolbarConfig}
        style={configs.style}
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
