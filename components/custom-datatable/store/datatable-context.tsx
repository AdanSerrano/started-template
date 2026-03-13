'use client'

import { createContext, useContext } from 'react'
import { useStore, type StoreApi } from 'zustand'
import type { DataTableStore } from './types'

export const DataTableStoreContext = createContext<StoreApi<
  DataTableStore<unknown>
> | null>(null)

export function useDataTableStore<TData, T>(
  selector: (state: DataTableStore<TData>) => T,
): T {
  const store = useContext(DataTableStoreContext)
  if (!store) {
    throw new Error(
      'useDataTableStore must be used within a SmartDataTable component',
    )
  }
  return useStore(store as StoreApi<DataTableStore<TData>>, selector)
}

export function useDataTableStoreApi<TData>(): StoreApi<DataTableStore<TData>> {
  const store = useContext(DataTableStoreContext)
  if (!store) {
    throw new Error(
      'useDataTableStoreApi must be used within a SmartDataTable component',
    )
  }
  return store as StoreApi<DataTableStore<TData>>
}
