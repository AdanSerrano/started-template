'use client'

import { useCallback, useMemo } from 'react'
import {
  buildSelectionConfig,
  buildExpansionConfig,
  buildPaginationConfig,
  buildSortingConfig,
  buildFilterConfig,
  buildCVConfig,
  buildMergedStyle,
  type SmartSelectionConfig,
  type SmartExpansionConfig,
  type SmartPaginationConfig,
  type SmartSortingConfig,
  type SmartFilterConfig,
  type SmartCVConfig,
} from '../smart-datatable.utils'
import type { DataTableStore, DataTableStoreState } from '../store/types'
import type {
  PaginationState,
  SortingState,
  ColumnVisibilityState,
  DensityType,
  StyleConfig,
} from '../types'
import type { StoreApi } from 'zustand'

export function useStoreCallbacks<TData>(
  store: StoreApi<DataTableStore<TData>>,
) {
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
  return {
    onSelectionChange,
    onExpansionChange,
    onSortingChange,
    onFilterChange,
    onPaginationChange,
    onCVChange,
    onRefresh,
  }
}

interface SmartConfigsInput<TData> {
  selCfg?: SmartSelectionConfig<TData> | undefined
  expCfg?: SmartExpansionConfig<TData> | undefined
  pagCfg?: SmartPaginationConfig | undefined
  sortCfg?: SmartSortingConfig | undefined
  filterCfg?: SmartFilterConfig | undefined
  cvCfg?: SmartCVConfig | undefined
  state: DataTableStoreState<TData>
  callbacks: ReturnType<typeof useStoreCallbacks<TData>>
  ptToolbarCfg: import('../types').ToolbarConfig | undefined
  style: StyleConfig | undefined
  initialDensity: DensityType | undefined
}

export function useSmartConfigs<TData>(input: SmartConfigsInput<TData>) {
  const {
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
  } = input
  const {
    onSelectionChange,
    onExpansionChange,
    onPaginationChange,
    onSortingChange,
    onFilterChange,
    onCVChange,
    onRefresh,
  } = callbacks
  const totalPages = Math.ceil(state.totalRows / state.pageSize) || 1

  const selection = useMemo(
    () => buildSelectionConfig(selCfg, state.selectedRows, onSelectionChange),
    [selCfg, state.selectedRows, onSelectionChange],
  )
  const expansion = useMemo(
    () => buildExpansionConfig(expCfg, state.expandedRows, onExpansionChange),
    [expCfg, state.expandedRows, onExpansionChange],
  )
  const pagination = useMemo(
    () =>
      buildPaginationConfig(
        pagCfg,
        state.pageIndex,
        state.pageSize,
        state.totalRows,
        totalPages,
        onPaginationChange,
      ),
    [
      pagCfg,
      state.pageIndex,
      state.pageSize,
      state.totalRows,
      totalPages,
      onPaginationChange,
    ],
  )
  const sorting = useMemo(
    () => buildSortingConfig(sortCfg, state.sorting, onSortingChange),
    [sortCfg, state.sorting, onSortingChange],
  )
  const filter = useMemo(
    () => buildFilterConfig(filterCfg, state.globalFilter, onFilterChange),
    [filterCfg, state.globalFilter, onFilterChange],
  )
  const columnVisibility = useMemo(
    () => buildCVConfig(cvCfg, state.columnVisibility, onCVChange),
    [cvCfg, state.columnVisibility, onCVChange],
  )
  const toolbarConfig = useMemo(
    () => ({ showRefresh: true, ...ptToolbarCfg, onRefresh }),
    [ptToolbarCfg, onRefresh],
  )
  const mergedStyle = useMemo(
    () => buildMergedStyle(style, initialDensity),
    [style, initialDensity],
  )

  return {
    selection,
    expansion,
    pagination,
    sorting,
    filter,
    columnVisibility,
    toolbarConfig,
    style: mergedStyle,
  }
}
