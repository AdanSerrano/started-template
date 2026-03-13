import * as XLSX from 'xlsx'
import type { IExcelExportService, ExcelExportOptions } from '@/lib/interfaces'

/**
 * Implementacion de IExcelExportService usando xlsx (SheetJS).
 * Para cambiar a ExcelJS, crear nuevo adapter.
 */
export class XLSXExportService implements IExcelExportService {
  async generate<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string; width?: number }[],
    options?: ExcelExportOptions,
  ): Promise<Buffer> {
    // Preparar datos con headers
    const headers = columns.map((c) => c.header)
    const rows = data.map((row) => columns.map((c) => row[c.key]))

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(
      options?.includeHeaders !== false ? [headers, ...rows] : rows,
    )

    // Aplicar anchos de columna
    worksheet['!cols'] = columns.map((c) => ({ wch: c.width ?? 15 }))

    // Crear workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options?.sheetName ?? 'Sheet1',
    )

    // Generar buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    return Buffer.from(buffer)
  }

  async generateMultiSheet(
    sheets: Array<{
      name: string
      data: Record<string, unknown>[]
      columns: { key: string; header: string; width?: number }[]
    }>,
    options?: ExcelExportOptions,
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new()

    for (const sheet of sheets) {
      const headers = sheet.columns.map((c) => c.header)
      const rows = sheet.data.map((row) => sheet.columns.map((c) => row[c.key]))

      const worksheet = XLSX.utils.aoa_to_sheet(
        options?.includeHeaders !== false ? [headers, ...rows] : rows,
      )

      worksheet['!cols'] = sheet.columns.map((c) => ({ wch: c.width ?? 15 }))

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
    }

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    return Buffer.from(buffer)
  }
}
