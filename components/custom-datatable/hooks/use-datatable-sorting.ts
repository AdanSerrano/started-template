'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { CustomColumnDef, SortingConfig, SortingState } from '../types'

export function useDataTableSorting<TData>(
  sorting: SortingConfig | undefined,
  columns: CustomColumnDef<TData>[],
) {
  const sortingRef = useRef(sorting)
  useEffect(() => {
    sortingRef.current = sorting
  }, [sorting])

  const toggleSort = useCallback((columnId: string) => {
    const currentSorting = sortingRef.current
    if (!currentSorting) return

    const currentSort = currentSorting.sorting.find((s) => s.id === columnId)
    let newSorting: SortingState[]

    if (!currentSort) {
      newSorting = currentSorting.enableMultiSort
        ? [...currentSorting.sorting, { id: columnId, desc: false }]
        : [{ id: columnId, desc: false }]
    } else if (!currentSort.desc) {
      newSorting = currentSorting.sorting.map((s) =>
        s.id === columnId ? { ...s, desc: true } : s,
      )
    } else {
      newSorting = currentSorting.sorting.filter((s) => s.id !== columnId)
    }

    sortingRef.current?.onSortingChange?.(newSorting)
  }, [])

  const getSortDirection = useCallback(
    (columnId: string): 'asc' | 'desc' | false => {
      const currentSorting = sortingRef.current
      if (!currentSorting) return false
      const sort = currentSorting.sorting.find((s) => s.id === columnId)
      if (!sort) return false
      return sort.desc ? 'desc' : 'asc'
    },
    [],
  )

  return { toggleSort, getSortDirection, columns }
}

export function useClientSideProcessing<TData>(
  data: TData[],
  sorting: SortingConfig | undefined,
  filterGlobalFilter: string | undefined,
  filterFn: (<T>(row: T, filter: string) => boolean) | undefined,
  columns: CustomColumnDef<TData>[],
) {
  const isManualSorting = sorting?.manualSorting ?? false

  return useMemo(() => {
    const needsClientFilter = !!(filterGlobalFilter && filterFn)
    const needsClientSort =
      !isManualSorting && !!sorting && sorting.sorting.length > 0

    if (!needsClientFilter && !needsClientSort) return data

    let result = [...data]

    if (needsClientFilter) {
      result = result.filter((row) => filterFn!(row, filterGlobalFilter!))
    }

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
}
