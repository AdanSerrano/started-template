'use client'

import { useCallback } from 'react'
import { getPageStyles, TABLE_STYLES, escapeHtml } from './print-styles'
import type { PrintConfig, CustomColumnDef, StyleConfig } from '../types'

interface UsePrintProps<TData> {
  enabled: boolean
  config?: PrintConfig | undefined
  data: TData[]
  columns: CustomColumnDef<TData>[]
  title?: string | undefined
  style?: StyleConfig | undefined
}

export function usePrint<TData>({
  enabled,
  config,
  data,
  columns,
  title,
}: UsePrintProps<TData>) {
  const getVisibleColumns = useCallback(() => {
    return columns.filter(
      (col) =>
        col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand',
    )
  }, [columns])

  const getCellValue = useCallback(
    (row: TData, column: CustomColumnDef<TData>): string => {
      const accessor = column.accessorKey as keyof TData
      if (!accessor) return ''
      const value = row[accessor]
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Si' : 'No'
      if (value instanceof Date) return value.toLocaleDateString()
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    },
    [],
  )

  const generatePrintHTML = useCallback((): string => {
    const visibleColumns = getVisibleColumns()
    const printTitle = config?.title ?? title ?? 'Datos de la tabla'
    const pageSize = config?.pageSize ?? 'A4'
    const orientation = config?.orientation ?? 'portrait'
    const pageStyles = getPageStyles(pageSize, orientation)

    const headerRow = visibleColumns
      .map((col) => `<th>${escapeHtml(String(col.header || col.id))}</th>`)
      .join('')
    const dataRows = data
      .map(
        (row) =>
          `<tr>${visibleColumns
            .map((col) => `<td>${escapeHtml(getCellValue(row, col))}</td>`)
            .join('')}</tr>`,
      )
      .join('')

    const currentDate = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const escapedTitle = escapeHtml(printTitle)

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapedTitle}</title>
        <style>${pageStyles}${TABLE_STYLES}</style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            ${config?.showLogo ? '<div class="print-logo"><!-- Logo placeholder --></div>' : ''}
            <h1 class="print-title">${escapedTitle}</h1>
            <p class="print-meta">Generado el ${currentDate}</p>
          </div>
          <div class="print-summary">
            <span>Total de registros: ${data.length}</span>
            <span>Columnas: ${visibleColumns.length}</span>
          </div>
          <table class="print-table">
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${dataRows}</tbody>
          </table>
          <div class="print-footer">
            <p>Pagina 1 • ${data.length} registros • Impreso desde el sistema</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `
  }, [getVisibleColumns, getCellValue, data, config, title])

  const printAll = useCallback((): void => {
    if (!enabled || !config?.enabled) return
    const printHTML = generatePrintHTML()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printHTML)
      printWindow.document.close()
    }
  }, [enabled, config, generatePrintHTML])

  const printPreview = useCallback((): Window | null => {
    if (!enabled || !config?.enabled) return null
    const printHTML = generatePrintHTML().replace(
      /<script>[\s\S]*?<\/script>/,
      '',
    )
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(printHTML)
      previewWindow.document.close()
    }
    return previewWindow
  }, [enabled, config, generatePrintHTML])

  const getPrintHTML = useCallback((): string => {
    return generatePrintHTML()
  }, [generatePrintHTML])

  return {
    printAll,
    printPreview,
    getPrintHTML,
    isPrintEnabled: enabled && config?.enabled,
  }
}
