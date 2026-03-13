'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { SortingState } from '../types'
import type { DataTableFetchParams } from '../store/types'

// ============================================
// TYPES
// ============================================

interface TableSearchParamsConfig {
  /** Default page size (default: 20) */
  defaultPageSize?: number
  /** Custom filter keys to read/write from URL (e.g. ['role', 'status', 'org']) */
  filterKeys?: string[]
}

interface TableSearchParamsReturn {
  /** Initial page index (0-based) for SmartDataTable */
  initialPageIndex: number
  /** Initial page size for SmartDataTable */
  initialPageSize: number
  /** Initial sorting state for SmartDataTable */
  initialSorting: SortingState[]
  /** Initial search/filter text for SmartDataTable */
  initialFilter: string
  /** True when URL has any datatable-related params (page, sort, search, or custom filters).
   *  Use this to skip `initialData` — server data won't match filtered state. */
  hasUrlParams: boolean
  /** Get a custom filter value from URL (returns 'all' if not present) */
  getFilter: (key: string) => string
  /** Update URL search params (call inside fetchFn). Removes defaults to keep URL clean. */
  updateParams: (
    fetchParams: DataTableFetchParams,
    filters?: Record<string, string>,
  ) => void
}

// ============================================
// HOOK
// ============================================

export function useTableSearchParams(
  config?: TableSearchParamsConfig,
): TableSearchParamsReturn {
  const searchParams = useSearchParams()
  const defaultPageSize = config?.defaultPageSize ?? 20

  const initialPageIndex = useMemo(() => {
    const page = Number(searchParams.get('page'))
    return page > 1 ? page - 1 : 0
  }, [searchParams])

  const initialPageSize = useMemo(() => {
    const size = Number(searchParams.get('pageSize'))
    return size > 0 ? size : defaultPageSize
  }, [searchParams, defaultPageSize])

  const initialSorting = useMemo((): SortingState[] => {
    const sortBy = searchParams.get('sortBy')
    if (!sortBy) return []
    return [{ id: sortBy, desc: searchParams.get('sortDir') === 'desc' }]
  }, [searchParams])

  const initialFilter = useMemo(
    () => searchParams.get('q') ?? '',
    [searchParams],
  )

  const hasUrlParams = useMemo(() => {
    const keys = ['page', 'pageSize', 'sortBy', 'sortDir', 'q']
    const filterKeys = config?.filterKeys ?? []
    return [...keys, ...filterKeys].some((k) => searchParams.has(k))
  }, [searchParams, config?.filterKeys])

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) ?? 'all',
    [searchParams],
  )

  const updateParams = useCallback(
    (fetchParams: DataTableFetchParams, filters?: Record<string, string>) => {
      const url = new URL(window.location.href)
      const sp = url.searchParams

      // Core datatable params
      const page = fetchParams.pageIndex + 1
      if (page > 1) sp.set('page', String(page))
      else sp.delete('page')

      if (fetchParams.pageSize !== defaultPageSize)
        sp.set('pageSize', String(fetchParams.pageSize))
      else sp.delete('pageSize')

      const sort = fetchParams.sorting[0]
      if (sort) {
        sp.set('sortBy', sort.id)
        sp.set('sortDir', sort.desc ? 'desc' : 'asc')
      } else {
        sp.delete('sortBy')
        sp.delete('sortDir')
      }

      if (fetchParams.globalFilter) sp.set('q', fetchParams.globalFilter)
      else sp.delete('q')

      // Custom filters (role, status, org, etc.)
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value && value !== 'all') sp.set(key, value)
          else sp.delete(key)
        }
      }

      window.history.replaceState(null, '', url.toString())
    },
    [defaultPageSize],
  )

  return {
    initialPageIndex,
    initialPageSize,
    initialSorting,
    initialFilter,
    hasUrlParams,
    getFilter,
    updateParams,
  }
}
