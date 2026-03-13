'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import type { CustomDataTableProps, SortingState } from '../types'

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

  // Refs for stable callbacks and state - prevents recreating callbacks on every render
  const callbacksRef = useRef({
    onSelectionChange: selection?.onSelectionChange,
    onExpansionChange: expansion?.onExpansionChange,
    onPaginationChange: pagination?.onPaginationChange,
    onSortingChange: sorting?.onSortingChange,
    onGlobalFilterChange: filter?.onGlobalFilterChange,
  })

  // Refs for data and getRowId to avoid dependency cascades
  const dataRef = useRef(data)
  const getRowIdRef = useRef(getRowId)
  const columnsRef = useRef(columns)

  // Ref for current selection state to avoid stale closures
  const selectionStateRef = useRef(selection?.selectedRows ?? {})
  const selectionModeRef = useRef(selection?.mode ?? 'multiple')
  const selectionEnabledRef = useRef(selection?.enabled ?? false)

  // Update refs in useEffect (required by React compiler)
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
    columnsRef.current = columns
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

  // Selection handlers - stable reference using refs
  const toggleRowSelection = useCallback(
    (rowId: string) => {
      if (!selectionEnabledRef.current) return

      const current = selectionStateRef.current
      const isSelected = !!current[rowId]

      if (selectionModeRef.current === 'single') {
        // Single mode: only one can be selected
        callbacksRef.current.onSelectionChange?.(
          isSelected ? {} : { [rowId]: true },
        )
      } else {
        // Multiple mode: toggle
        const newSelection = { ...current }
        if (isSelected) {
          delete newSelection[rowId]
        } else {
          newSelection[rowId] = true
        }
        callbacksRef.current.onSelectionChange?.(newSelection)
      }
    },
    [], // Empty deps - uses refs for stable reference
  )

  // Ref for expansion state
  const expansionStateRef = useRef(expansion?.expandedRows ?? {})
  const expansionEnabledRef = useRef(expansion?.enabled ?? false)
  useEffect(() => {
    expansionStateRef.current = expansion?.expandedRows ?? {}
    expansionEnabledRef.current = expansion?.enabled ?? false
  }, [expansion?.expandedRows, expansion?.enabled])

  // Stable selectAllRows - uses refs to avoid recreation on data changes
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
  }, []) // Empty deps - stable reference using refs

  const clearSelection = useCallback(() => {
    callbacksRef.current.onSelectionChange?.({})
  }, [])

  // Selection state object - stable reference when selection doesn't change
  // Each row will check its own state using this object directly
  const selectionState = useMemo(
    () => selection?.selectedRows ?? {},
    [selection?.selectedRows],
  )

  // isRowSelected - stable callback that uses the selection state
  // This is kept for backwards compatibility but rows should use selectionState directly
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
    if (!selectionEnabled) return 0
    if (!selectionSelectedRows) return 0
    return Object.keys(selectionSelectedRows).filter(
      (k) => selectionSelectedRows[k],
    ).length
  }, [selectionEnabled, selectionSelectedRows])

  // Expansion handlers - stable reference using refs
  const toggleRowExpansion = useCallback(
    (rowId: string) => {
      if (!expansionEnabledRef.current) return

      const current = expansionStateRef.current
      const isExpanded = !!current[rowId]

      const newExpansion = { ...current }
      if (isExpanded) {
        delete newExpansion[rowId]
      } else {
        newExpansion[rowId] = true
      }
      callbacksRef.current.onExpansionChange?.(newExpansion)
    },
    [], // Empty deps - uses refs for stable reference
  )

  // Ref for expansion canExpand function
  const canExpandRef = useRef(expansion?.canExpand)
  useEffect(() => {
    canExpandRef.current = expansion?.canExpand
  }, [expansion?.canExpand])

  // Stable expandAllRows - uses refs to avoid recreation on data changes
  const expandAllRows = useCallback(() => {
    if (!expansionEnabledRef.current) return

    const newExpansion: Record<string, boolean> = {}
    const currentData = dataRef.current
    const getId = getRowIdRef.current
    const canExpandFn = canExpandRef.current

    for (let i = 0; i < currentData.length; i++) {
      const row = currentData[i]!
      const canExpand = canExpandFn ? canExpandFn(row) : true
      if (canExpand) {
        newExpansion[getId(row)] = true
      }
    }
    callbacksRef.current.onExpansionChange?.(newExpansion)
  }, []) // Empty deps - stable reference using refs

  const collapseAllRows = useCallback(() => {
    callbacksRef.current.onExpansionChange?.({})
  }, [])

  // Expansion state object - stable reference when expansion doesn't change
  const expansionState = useMemo(
    () => expansion?.expandedRows ?? {},
    [expansion?.expandedRows],
  )

  // isRowExpanded - stable callback for backwards compatibility
  const isRowExpanded = useCallback(
    (rowId: string) => !!expansionState[rowId],
    [expansionState],
  )

  // Sorting refs for stable callbacks
  const sortingRef = useRef(sorting)
  useEffect(() => {
    sortingRef.current = sorting
  }, [sorting])

  // Sorting handlers - stable reference using refs
  const toggleSort = useCallback(
    (columnId: string) => {
      const currentSorting = sortingRef.current
      if (!currentSorting) return

      const currentSort = currentSorting.sorting.find((s) => s.id === columnId)
      let newSorting: SortingState[]

      if (!currentSort) {
        // Not sorted -> asc
        newSorting = currentSorting.enableMultiSort
          ? [...currentSorting.sorting, { id: columnId, desc: false }]
          : [{ id: columnId, desc: false }]
      } else if (!currentSort.desc) {
        // asc -> desc
        newSorting = currentSorting.sorting.map((s) =>
          s.id === columnId ? { ...s, desc: true } : s,
        )
      } else {
        // desc -> remove
        newSorting = currentSorting.sorting.filter((s) => s.id !== columnId)
      }

      callbacksRef.current.onSortingChange?.(newSorting)
    },
    [], // Empty deps - uses refs for stable reference
  )

  const getSortDirection = useCallback(
    (columnId: string): 'asc' | 'desc' | false => {
      const currentSorting = sortingRef.current
      if (!currentSorting) return false
      const sort = currentSorting.sorting.find((s) => s.id === columnId)
      if (!sort) return false
      return sort.desc ? 'desc' : 'asc'
    },
    [], // Empty deps - uses refs for stable reference
  )

  // Pagination refs for stable callbacks
  const paginationRef = useRef(pagination)
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // Pagination handlers - stable reference using refs
  const goToPage = useCallback(
    (pageIndex: number) => {
      const currentPagination = paginationRef.current
      if (!currentPagination) return
      callbacksRef.current.onPaginationChange?.({
        pageIndex,
        pageSize: currentPagination.pageSize,
      })
    },
    [], // Empty deps - uses refs for stable reference
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (!paginationRef.current) return
      callbacksRef.current.onPaginationChange?.({
        pageIndex: 0,
        pageSize,
      })
    },
    [], // Empty deps - uses refs for stable reference
  )

  // Filter handler
  const setGlobalFilter = useCallback((value: string) => {
    callbacksRef.current.onGlobalFilterChange?.(value)
  }, [])

  // Process data (filtering + sorting for client-side)
  const filterGlobalFilter = filter?.globalFilter
  const filterFn = filter?.filterFn
  const isManualSorting = sorting?.manualSorting ?? false
  const processedData = useMemo(() => {
    const needsClientFilter = !!(filterGlobalFilter && filterFn)
    const needsClientSort =
      !isManualSorting && !!sorting && sorting.sorting.length > 0

    // Fast path: no client-side processing needed (server handles it)
    if (!needsClientFilter && !needsClientSort) return data

    let result = [...data]

    // Client-side filtering
    if (needsClientFilter) {
      result = result.filter((row) => filterFn!(row, filterGlobalFilter!))
    }

    // Client-side sorting
    if (needsClientSort) {
      result.sort((a, b) => {
        for (const sort of sorting!.sorting) {
          const column = columns.find((c) => c.id === sort.id)
          if (!column) continue

          let comparison = 0
          if (column.sortingFn) {
            comparison = column.sortingFn(a, b)
          } else if (column.accessorKey) {
            const aVal = a[column.accessorKey]
            const bVal = b[column.accessorKey]
            if (aVal < bVal) comparison = -1
            else if (aVal > bVal) comparison = 1
          }

          if (comparison !== 0) {
            return sort.desc ? -comparison : comparison
          }
        }
        return 0
      })
    }

    return result
  }, [data, filterGlobalFilter, filterFn, isManualSorting, sorting, columns])

  // Get selected rows - stable using refs
  const getSelectedRows = useCallback(() => {
    if (!selectionEnabledRef.current) return []
    const currentData = dataRef.current
    const getId = getRowIdRef.current
    const selectedRows = selectionStateRef.current

    const result: TData[] = []
    for (let i = 0; i < currentData.length; i++) {
      const row = currentData[i]!
      if (selectedRows[getId(row)]) {
        result.push(row)
      }
    }
    return result
  }, []) // Empty deps - stable reference using refs

  return {
    // Selection
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    isRowSelected,
    selectionState, // Direct state object for optimized row rendering
    isAllSelected,
    isSomeSelected,
    selectedCount,
    getSelectedRows,

    // Expansion
    toggleRowExpansion,
    expandAllRows,
    collapseAllRows,
    isRowExpanded,
    expansionState, // Direct state object for optimized row rendering

    // Sorting
    toggleSort,
    getSortDirection,

    // Pagination
    goToPage,
    setPageSize,

    // Filter
    setGlobalFilter,

    // Processed data
    processedData,
  }
}
