'use client'

import { useCallback } from 'react'
import type { PrintConfig, CustomColumnDef, StyleConfig } from '../types'

// Utility function to escape HTML and prevent XSS
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char)
}

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
      if (value instanceof Date) return value.toLocaleDateString()
      if (typeof value === 'object') return JSON.stringify(value)

      return String(value)
    },
    [],
  )

  // Generate print HTML
  const generatePrintHTML = useCallback((): string => {
    const visibleColumns = getVisibleColumns()
    const printTitle = config?.title ?? title ?? 'Datos de la tabla'
    const pageSize = config?.pageSize ?? 'A4'
    const orientation = config?.orientation ?? 'portrait'

    const pageStyles = `
      @page {
        size: ${pageSize} ${orientation};
        margin: 1.5cm;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `

    const tableStyles = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #1a1a1a;
        background: white;
      }

      .print-container {
        padding: 20px;
        max-width: 100%;
      }

      .print-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
      }

      .print-title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 5px;
      }

      .print-meta {
        font-size: 11px;
        color: #6b7280;
      }

      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      .print-table th {
        background-color: #f3f4f6;
        font-weight: 600;
        text-align: left;
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        color: #374151;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .print-table td {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .print-table tr:nth-child(even) {
        background-color: #f9fafb;
      }

      .print-table tr:hover {
        background-color: #f3f4f6;
      }

      .print-footer {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
        font-size: 10px;
        color: #9ca3af;
        text-align: center;
      }

      .print-summary {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 11px;
        color: #6b7280;
      }
    `

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
        <style>
          ${pageStyles}
          ${tableStyles}
        </style>
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
            <thead>
              <tr>${headerRow}</tr>
            </thead>
            <tbody>
              ${dataRows}
            </tbody>
          </table>

          <div class="print-footer">
            <p>Página 1 • ${data.length} registros • Impreso desde el sistema</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `
  }, [getVisibleColumns, getCellValue, data, config, title])

  // Print all data
  const printAll = useCallback((): void => {
    if (!enabled || !config?.enabled) return

    const printHTML = generatePrintHTML()
    // Note: Cannot use noopener as we need document.write access
    const printWindow = window.open('', '_blank')

    if (printWindow) {
      printWindow.document.write(printHTML)
      printWindow.document.close()
    }
  }, [enabled, config, generatePrintHTML])

  // Print preview (opens in new window without auto-print)
  const printPreview = useCallback((): Window | null => {
    if (!enabled || !config?.enabled) return null

    const printHTML = generatePrintHTML().replace(
      /<script>[\s\S]*?<\/script>/,
      '',
    )
    // Note: Cannot use noopener as we need document.write access
    const previewWindow = window.open('', '_blank')

    if (previewWindow) {
      previewWindow.document.write(printHTML)
      previewWindow.document.close()
    }

    return previewWindow
  }, [enabled, config, generatePrintHTML])

  // Get print HTML without opening window
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
