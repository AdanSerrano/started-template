'use client'

import { useCallback, useEffect, useRef } from 'react'
import { DEFAULT_FILTER_DEBOUNCE_MS } from '../constants'
import type {
  FilterConfig,
  ExportFormat,
  ColumnVisibilityConfig,
} from '../types'

interface UseToolbarFilterParams {
  filter: FilterConfig | undefined
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function useToolbarFilter({ filter, inputRef }: UseToolbarFilterParams) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localFilterRef = useRef(filter?.globalFilter ?? '')
  const filterRef = useRef(filter)

  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  const externalFilter = filter?.globalFilter ?? ''

  useEffect(() => {
    if (
      localFilterRef.current !== externalFilter &&
      inputRef.current !== document.activeElement
    ) {
      localFilterRef.current = externalFilter
      if (inputRef.current) {
        inputRef.current.value = externalFilter
      }
    }
  }, [externalFilter, inputRef])

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      localFilterRef.current = value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const debounceMs =
        filterRef.current?.debounceMs ?? DEFAULT_FILTER_DEBOUNCE_MS
      debounceRef.current = setTimeout(() => {
        filterRef.current?.onGlobalFilterChange?.(localFilterRef.current)
      }, debounceMs)
    },
    [],
  )

  const handleClearFilter = useCallback(() => {
    localFilterRef.current = ''
    if (inputRef.current) inputRef.current.value = ''
    filterRef.current?.onGlobalFilterChange?.('')
    inputRef.current?.focus()
  }, [inputRef])

  const handleSubmitFilter = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    filterRef.current?.onGlobalFilterChange?.(localFilterRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    externalFilter,
    handleFilterChange,
    handleClearFilter,
    handleSubmitFilter,
  }
}

interface UseToolbarActionsParams {
  onExport: ((format: ExportFormat) => void) | undefined
  exportConfig:
    | { onExport?: ((format: ExportFormat, data: never[]) => void) | undefined }
    | undefined
  columnVisibility: ColumnVisibilityConfig | undefined
}

export function useToolbarActions({
  onExport,
  exportConfig,
  columnVisibility,
}: UseToolbarActionsParams) {
  const onExportRef = useRef(onExport)
  const exportConfigRef = useRef(exportConfig)
  const columnVisibilityRef = useRef(columnVisibility)

  useEffect(() => {
    onExportRef.current = onExport
    exportConfigRef.current = exportConfig
    columnVisibilityRef.current = columnVisibility
  }, [onExport, exportConfig, columnVisibility])

  const handleExport = useCallback((format: ExportFormat) => {
    onExportRef.current?.(format)
    exportConfigRef.current?.onExport?.(format, [])
  }, [])

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, visible: boolean) => {
      const cv = columnVisibilityRef.current
      if (!cv) return
      const newVisibility = { ...cv.columnVisibility, [columnId]: visible }
      cv.onColumnVisibilityChange(newVisibility)
    },
    [],
  )

  return { handleExport, handleColumnVisibilityChange }
}
