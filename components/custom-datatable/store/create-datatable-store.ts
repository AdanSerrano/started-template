import { createStore } from 'zustand/vanilla'
import type { DataTableStore, DataTableStoreConfig } from './types'

export function createDataTableStore<TData>(
  config: DataTableStoreConfig<TData>,
) {
  const { fetchFn, getRowId } = config
  const initialPageIndex = config.initialPageIndex ?? 0
  const initialPageSize = config.initialPageSize ?? 10
  const initialSorting = config.initialSorting ?? []
  const initialFilter = config.initialFilter ?? ''
  const initialCV = config.initialColumnVisibility ?? {}
  const hasInitialData = config.initialData !== undefined

  // Stale-request tracking: only the latest request updates data
  let fetchCounter = 0
  // Active-fetch tracking: ensures loading states are always cleared
  let activeFetches = 0

  return createStore<DataTableStore<TData>>((set, get) => ({
    // Initial state — if initialData was provided, start ready (no skeleton)
    data: config.initialData ?? [],
    totalRows: config.initialTotalRows ?? 0,
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
    sorting: initialSorting,
    globalFilter: initialFilter,
    selectedRows: {},
    expandedRows: {},
    columnVisibility: initialCV,
    isLoading: !hasInitialData,
    isPending: false,

    // Fetch data from server with current params
    fetchData: async () => {
      const { pageIndex, pageSize, sorting, globalFilter } = get()
      const requestId = ++fetchCounter
      activeFetches++

      // Safety timeout: if server action hangs, force-clear loading
      const timeoutId = setTimeout(() => {
        const s = get()
        if (s.isLoading || s.isPending) {
          set({ isLoading: false, isPending: false })
        }
      }, 15_000)

      try {
        const result = await fetchFn({
          pageIndex,
          pageSize,
          sorting,
          globalFilter,
        })

        // Stale response: a newer fetch was started — don't overwrite data
        // but always clear loading states to prevent stuck spinners
        if (requestId !== fetchCounter) {
          const s = get()
          if (s.isLoading) {
            // Initial load: show stale data (better than skeletons)
            set({
              data: result.data,
              totalRows: result.totalRows,
              isLoading: false,
              isPending: false,
            })
          } else if (s.isPending) {
            // Refetch: don't overwrite data (could revert optimistic updates)
            // but clear isPending to prevent stuck loading state
            set({ isPending: false })
          }
          return
        }

        // If page is empty but data exists, go to last valid page
        if (result.data.length === 0 && result.totalRows > 0 && pageIndex > 0) {
          const lastPage = Math.max(
            0,
            Math.ceil(result.totalRows / pageSize) - 1,
          )
          set({ pageIndex: lastPage })
          return get().fetchData()
        }

        set({
          data: result.data,
          totalRows: result.totalRows,
          isLoading: false,
          isPending: false,
        })
      } catch {
        set({ isLoading: false, isPending: false })
      } finally {
        clearTimeout(timeoutId)
        activeFetches--
        // Safety net: when no fetches are in-flight, ensure loading is cleared
        if (activeFetches === 0) {
          const s = get()
          if (s.isLoading || s.isPending) {
            set({ isLoading: false, isPending: false })
          }
        }
      }
    },

    // Refetch with current params (awaitable — resolves when data arrives)
    refetch: async () => {
      set({ isPending: true })
      await get().fetchData()
    },

    // Silent refetch — no loading indicator, always wins over in-flight requests
    silentRefetch: async () => {
      fetchCounter++
      await get().fetchData()
    },

    // Reset to page 0 and refetch (awaitable — resolves when data arrives)
    resetAndRefetch: async () => {
      set({ pageIndex: 0, isPending: true })
      await get().fetchData()
    },

    // Row update — invalidates in-flight fetches so they don't overwrite
    updateRow: (rowId, updater) => {
      fetchCounter++
      set((state) => ({
        data: state.data.map((row) =>
          getRowId(row) === rowId ? { ...row, ...updater } : row,
        ),
      }))
    },

    // Remove row — invalidates in-flight fetches so they don't overwrite
    removeRow: (rowId) => {
      fetchCounter++
      set((state) => {
        const newSelected = { ...state.selectedRows }
        delete newSelected[rowId]
        return {
          data: state.data.filter((row) => getRowId(row) !== rowId),
          totalRows: state.totalRows - 1,
          selectedRows: newSelected,
        }
      })
    },

    // Pagination — auto-refetch
    setPageIndex: (pageIndex) => {
      set({ pageIndex, isPending: true })
      get().fetchData()
    },

    setPageSize: (pageSize) => {
      set({ pageSize, pageIndex: 0, isPending: true })
      get().fetchData()
    },

    // Sorting — auto-refetch, resets to page 0
    setSorting: (sorting) => {
      set({ sorting, pageIndex: 0, isPending: true })
      get().fetchData()
    },

    // Filter — auto-refetch, resets to page 0
    setGlobalFilter: (globalFilter) => {
      set({ globalFilter, pageIndex: 0, isPending: true })
      get().fetchData()
    },

    // Selection (no refetch)
    setSelectedRows: (selectedRows) => set({ selectedRows }),
    clearSelection: () => set({ selectedRows: {} }),

    // Expansion (no refetch)
    setExpandedRows: (expandedRows) => set({ expandedRows }),

    // Column visibility (no refetch)
    setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  }))
}
