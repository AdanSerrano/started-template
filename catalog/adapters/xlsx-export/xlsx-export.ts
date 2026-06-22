import ExcelJS from 'exceljs'
import type { IExcelExportService, ExcelExportOptions } from '@/lib/interfaces'

/**
 * Implementacion de IExcelExportService usando ExcelJS.
 */
export class XLSXExportService implements IExcelExportService {
  async generate<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string; width?: number }[],
    options?: ExcelExportOptions,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(options?.sheetName ?? 'Sheet1')

    worksheet.columns = columns.map((c) => {
      const col: Partial<ExcelJS.Column> = {
        key: String(c.key),
        width: c.width ?? 15,
      }
      if (options?.includeHeaders !== false) col.header = c.header
      return col
    })

    if (options?.includeHeaders === false) {
      // Remove auto-generated header row
      worksheet.spliceRows(1, 1)
    }

    for (const row of data) {
      const values = columns.map((c) => row[c.key])
      worksheet.addRow(values)
    }

    const buffer = await workbook.xlsx.writeBuffer()
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
    const workbook = new ExcelJS.Workbook()

    for (const sheet of sheets) {
      const worksheet = workbook.addWorksheet(sheet.name)

      worksheet.columns = sheet.columns.map((c) => {
        const col: Partial<ExcelJS.Column> = {
          key: c.key,
          width: c.width ?? 15,
        }
        if (options?.includeHeaders !== false) col.header = c.header
        return col
      })

      if (options?.includeHeaders === false) {
        worksheet.spliceRows(1, 1)
      }

      for (const row of sheet.data) {
        const values = sheet.columns.map((c) => row[c.key])
        worksheet.addRow(values)
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
