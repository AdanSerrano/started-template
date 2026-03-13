'use client'

import { useCallback } from 'react'
import type { CopyConfig, CustomColumnDef } from '../types'

interface UseCopyClipboardProps<TData> {
  enabled: boolean
  config?: CopyConfig | undefined
  data: TData[]
  columns: CustomColumnDef<TData>[]
  selectedRows?: Set<string> | undefined
  getRowId: (row: TData) => string
}

export function useCopyClipboard<TData>({
  enabled,
  config,
  data,
  columns,
  selectedRows,
  getRowId,
}: UseCopyClipboardProps<TData>) {
  const format = config?.format ?? 'text'
  const includeHeaders = config?.includeHeaders ?? true

  // Get visible columns (exclude actions, selection, etc.)
  const getVisibleColumns = useCallback(() => {
    return columns.filter(
      (col) =>
        col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand',
    )
  }, [columns])

  // Get cell value as string
  const getCellValue = useCallback(
    (row: TData, column: CustomColumnDef<TData>): string => {
      const accessor = column.accessorKey as keyof TData
      if (!accessor) return ''

      const value = row[accessor]

      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Sí' : 'No'
      if (value instanceof Date) return value.toISOString()
      if (typeof value === 'object') return JSON.stringify(value)

      return String(value)
    },
    [],
  )

  // Get header as string
  const getHeaderString = useCallback(
    (column: CustomColumnDef<TData>): string => {
      if (typeof column.header === 'string') {
        return column.header
      }
      return column.id
    },
    [],
  )

  // Format data as plain text
  const formatAsText = useCallback(
    (rows: TData[]): string => {
      const visibleColumns = getVisibleColumns()
      const lines: string[] = []

      if (includeHeaders) {
        const headers = visibleColumns
          .map((col) => getHeaderString(col))
          .join('\t')
        lines.push(headers)
      }

      rows.forEach((row) => {
        const values = visibleColumns
          .map((col) => getCellValue(row, col))
          .join('\t')
        lines.push(values)
      })

      return lines.join('\n')
    },
    [getVisibleColumns, getCellValue, includeHeaders, getHeaderString],
  )

  // Format data as CSV
  const formatAsCSV = useCallback(
    (rows: TData[]): string => {
      const visibleColumns = getVisibleColumns()
      const lines: string[] = []

      const escapeCSV = (value: string): string => {
        if (
          value.includes(',') ||
          value.includes('"') ||
          value.includes('\n')
        ) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      if (includeHeaders) {
        const headers = visibleColumns
          .map((col) => escapeCSV(getHeaderString(col)))
          .join(',')
        lines.push(headers)
      }

      rows.forEach((row) => {
        const values = visibleColumns
          .map((col) => escapeCSV(getCellValue(row, col)))
          .join(',')
        lines.push(values)
      })

      return lines.join('\n')
    },
    [getVisibleColumns, getCellValue, includeHeaders, getHeaderString],
  )

  // Format data as JSON
  const formatAsJSON = useCallback(
    (rows: TData[]): string => {
      const visibleColumns = getVisibleColumns()

      const formattedRows = rows.map((row) => {
        const obj: Record<string, unknown> = {}
        visibleColumns.forEach((col) => {
          const key = col.id
          const accessor = col.accessorKey as keyof TData
          if (accessor) {
            obj[key] = row[accessor]
          }
        })
        return obj
      })

      return JSON.stringify(formattedRows, null, 2)
    },
    [getVisibleColumns],
  )

  // Format data based on config
  const formatData = useCallback(
    (rows: TData[]): string => {
      switch (format) {
        case 'csv':
          return formatAsCSV(rows)
        case 'json':
          return formatAsJSON(rows)
        case 'text':
        default:
          return formatAsText(rows)
      }
    },
    [format, formatAsText, formatAsCSV, formatAsJSON],
  )

  // Copy all data
  const copyAll = useCallback(async (): Promise<boolean> => {
    if (!enabled || !config?.enabled) return false

    try {
      const formattedData = formatData(data)
      await navigator.clipboard.writeText(formattedData)
      config.onCopy?.(formattedData)
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }, [enabled, config, data, formatData])

  // Copy selected rows
  const copySelected = useCallback(async (): Promise<boolean> => {
    if (
      !enabled ||
      !config?.enabled ||
      !selectedRows ||
      selectedRows.size === 0
    ) {
      return false
    }

    try {
      const selectedData = data.filter((row) => selectedRows.has(getRowId(row)))
      const formattedData = formatData(selectedData)
      await navigator.clipboard.writeText(formattedData)
      config.onCopy?.(formattedData)
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }, [enabled, config, data, selectedRows, getRowId, formatData])

  // Copy single row
  const copyRow = useCallback(
    async (row: TData): Promise<boolean> => {
      if (!enabled || !config?.enabled) return false

      try {
        const formattedData = formatData([row])
        await navigator.clipboard.writeText(formattedData)
        config.onCopy?.(formattedData)
        return true
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
      }
    },
    [enabled, config, formatData],
  )

  // Copy specific cell value
  const copyCell = useCallback(
    async (row: TData, columnId: string): Promise<boolean> => {
      if (!enabled || !config?.enabled) return false

      try {
        const column = columns.find((col) => col.id === columnId)
        if (!column) return false

        const value = getCellValue(row, column)
        await navigator.clipboard.writeText(value)
        config.onCopy?.(value)
        return true
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
      }
    },
    [enabled, config, columns, getCellValue],
  )

  return {
    copyAll,
    copySelected,
    copyRow,
    copyCell,
    formatData,
    isCopyEnabled: enabled && config?.enabled,
  }
}
