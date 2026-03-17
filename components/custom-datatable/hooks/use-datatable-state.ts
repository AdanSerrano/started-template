'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import {
  useClientSideProcessing,
  useDataTableSorting,
} from './use-datatable-sorting'
import type { CustomDataTableProps } from '../types'

export function useDataTableState<TData>(props: CustomDataTableProps<TData>) {
  const {
    data,
    columns,
    getRowId,
    selection,
    expansion,
    pagination,
    sorting,
    filter,
  } = props

  const callbacksRef = useRef({
    onSelectionChange: selection?.onSelectionChange,
    onExpansionChange: expansion?.onExpansionChange,
    onPaginationChange: pagination?.onPaginationChange,
    onSortingChange: sorting?.onSortingChange,
    onGlobalFilterChange: filter?.onGlobalFilterChange,
  })
  const dataRef = useRef(data)
  const getRowIdRef = useRef(getRowId)
  const selectionStateRef = useRef(selection?.selectedRows ?? {})
  const selectionModeRef = useRef(selection?.mode ?? 'multiple')
  const selectionEnabledRef = useRef(selection?.enabled ?? false)

  useEffect(() => {
    callbacksRef.current = {
      onSelectionChange: selection?.onSelectionChange,
      onExpansionChange: expansion?.onExpansionChange,
      onPaginationChange: pagination?.onPaginationChange,
      onSortingChange: sorting?.onSortingChange,
      onGlobalFilterChange: filter?.onGlobalFilterChange,
    }
    dataRef.current = data
    getRowIdRef.current = getRowId
    selectionStateRef.current = selection?.selectedRows ?? {}
    selectionModeRef.current = selection?.mode ?? 'multiple'
    selectionEnabledRef.current = selection?.enabled ?? false
  }, [
    selection,
    expansion,
    pagination,
    sorting,
    filter,
    data,
    getRowId,
    columns,
  ])

  // --- Selection ---
  const toggleRowSelection = useCallback((rowId: string) => {
    if (!selectionEnabledRef.current) return
    const current = selectionStateRef.current
    const isSelected = !!current[rowId]
    if (selectionModeRef.current === 'single') {
      callbacksRef.current.onSelectionChange?.(
        isSelected ? {} : { [rowId]: true },
      )
    } else {
      const newSelection = { ...current }
      if (isSelected) delete newSelection[rowId]
      else newSelection[rowId] = true
      callbacksRef.current.onSelectionChange?.(newSelection)
    }
  }, [])

  const selectAllRows = useCallback(() => {
    if (!selectionEnabledRef.current || selectionModeRef.current === 'single')
      return
    const newSelection: Record<string, boolean> = {}
    const currentData = dataRef.current
    const getId = getRowIdRef.current
    for (let i = 0; i < currentData.length; i++) {
      newSelection[getId(currentData[i]!)] = true
    }
    callbacksRef.current.onSelectionChange?.(newSelection)
  }, [])

  const clearSelection = useCallback(() => {
    callbacksRef.current.onSelectionChange?.({})
  }, [])

  const selectionState = useMemo(
    () => selection?.selectedRows ?? {},
    [selection?.selectedRows],
  )
  const isRowSelected = useCallback(
    (rowId: string) => !!selectionState[rowId],
    [selectionState],
  )

  const selectionEnabled = selection?.enabled
  const selectionSelectedRows = selection?.selectedRows
  const isAllSelected = useMemo(() => {
    if (!selectionEnabled || data.length === 0) return false
    return data.every((row) => selectionSelectedRows?.[getRowId(row)])
  }, [selectionEnabled, selectionSelectedRows, data, getRowId])

  const isSomeSelected = useMemo(() => {
    if (!selectionEnabled || data.length === 0) return false
    const selectedCount = data.filter(
      (row) => selectionSelectedRows?.[getRowId(row)],
    ).length
    return selectedCount > 0 && selectedCount < data.length
  }, [selectionEnabled, selectionSelectedRows, data, getRowId])

  const selectedCount = useMemo(() => {
    if (!selectionEnabled || !selectionSelectedRows) return 0
    return Object.keys(selectionSelectedRows).filter(
      (k) => selectionSelectedRows[k],
    ).length
  }, [selectionEnabled, selectionSelectedRows])

  // --- Expansion ---
  const expansionStateRef = useRef(expansion?.expandedRows ?? {})
  const expansionEnabledRef = useRef(expansion?.enabled ?? false)
  const canExpandRef = useRef(expansion?.canExpand)
  useEffect(() => {
    expansionStateRef.current = expansion?.expandedRows ?? {}
    expansionEnabledRef.current = expansion?.enabled ?? false
    canExpandRef.current = expansion?.canExpand
  }, [expansion?.expandedRows, expansion?.enabled, expansion?.canExpand])

  const toggleRowExpansion = useCallback((rowId: string) => {
    if (!expansionEnabledRef.current) return
    const current = expansionStateRef.current
    const newExpansion = { ...current }
    if (current[rowId]) delete newExpansion[rowId]
    else newExpansion[rowId] = true
    callbacksRef.current.onExpansionChange?.(newExpansion)
  }, [])

  const expandAllRows = useCallback(() => {
    if (!expansionEnabledRef.current) return
    const newExpansion: Record<string, boolean> = {}
    const currentData = dataRef.current
    const getId = getRowIdRef.current
    const canExpandFn = canExpandRef.current
    for (let i = 0; i < currentData.length; i++) {
      const row = currentData[i]!
      if (canExpandFn ? canExpandFn(row) : true) newExpansion[getId(row)] = true
    }
    callbacksRef.current.onExpansionChange?.(newExpansion)
  }, [])

  const collapseAllRows = useCallback(() => {
    callbacksRef.current.onExpansionChange?.({})
  }, [])

  const expansionState = useMemo(
    () => expansion?.expandedRows ?? {},
    [expansion?.expandedRows],
  )
  const isRowExpanded = useCallback(
    (rowId: string) => !!expansionState[rowId],
    [expansionState],
  )

  // --- Sorting ---
  const { toggleSort, getSortDirection } = useDataTableSorting(sorting, columns)

  // --- Pagination ---
  const paginationRef = useRef(pagination)
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  const goToPage = useCallback((pageIndex: number) => {
    const cur = paginationRef.current
    if (!cur) return
    callbacksRef.current.onPaginationChange?.({
      pageIndex,
      pageSize: cur.pageSize,
    })
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    if (!paginationRef.current) return
    callbacksRef.current.onPaginationChange?.({ pageIndex: 0, pageSize })
  }, [])

  // --- Filter ---
  const setGlobalFilter = useCallback((value: string) => {
    callbacksRef.current.onGlobalFilterChange?.(value)
  }, [])

  // --- Client-side processing ---
  const processedData = useClientSideProcessing(
    data,
    sorting,
    filter?.globalFilter,
    filter?.filterFn,
    columns,
  )

  // --- Get selected rows ---
  const getSelectedRows = useCallback(() => {
    if (!selectionEnabledRef.current) return []
    const currentData = dataRef.current
    const getId = getRowIdRef.current
    const selectedRows = selectionStateRef.current
    const result: TData[] = []
    for (let i = 0; i < currentData.length; i++) {
      const row = currentData[i]!
      if (selectedRows[getId(row)]) result.push(row)
    }
    return result
  }, [])

  return {
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    isRowSelected,
    selectionState,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    getSelectedRows,
    toggleRowExpansion,
    expandAllRows,
    collapseAllRows,
    isRowExpanded,
    expansionState,
    toggleSort,
    getSortDirection,
    goToPage,
    setPageSize,
    setGlobalFilter,
    processedData,
  }
}
