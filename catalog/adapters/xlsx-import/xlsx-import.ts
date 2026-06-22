import ExcelJS from 'exceljs'
import type {
  IExcelImportService,
  ParseResult,
  ExcelParseOptions,
} from '@/lib/interfaces'

/**
 * Implementacion de IExcelImportService usando ExcelJS.
 */
export class XLSXImportService implements IExcelImportService {
  async parse<T extends Record<string, unknown>>(
    file: Buffer,
    options?: ExcelParseOptions,
  ): Promise<ParseResult<T>> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(file as unknown as ExcelJS.Buffer)

    const worksheet = this.getWorksheet(workbook, options)
    if (!worksheet) {
      return {
        data: [],
        errors: [{ row: 0, message: 'Hoja no encontrada' }],
        meta: { totalRows: 0, successfulRows: 0, failedRows: 0 },
      }
    }

    const data: T[] = []
    const errors: Array<{ row: number; message: string }> = []
    let headers: string[] = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 && options?.hasHeader !== false) {
        headers = row.values
          ? (row.values as unknown[]).slice(1).map((v) => String(v ?? ''))
          : []
        return
      }

      try {
        const values = row.values
          ? (row.values as unknown[]).slice(1).map((v) => this.getCellValue(v))
          : []

        if (
          options?.skipEmptyRows !== false &&
          values.every((v) => v == null)
        ) {
          return
        }

        const record: Record<string, unknown> = {}
        if (headers.length > 0) {
          headers.forEach((header, index) => {
            record[header] = values[index] ?? null
          })
        } else {
          values.forEach((value, index) => {
            record[String(index)] = value
          })
        }

        data.push(record as T)
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    })

    return {
      data,
      errors,
      meta: {
        totalRows: data.length + errors.length,
        successfulRows: data.length,
        failedRows: errors.length,
      },
    }
  }

  async getSheetNames(file: Buffer): Promise<string[]> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(file as unknown as ExcelJS.Buffer)
    return workbook.worksheets.map((ws) => ws.name)
  }

  async parseWithSchema<T>(
    file: Buffer,
    schema: {
      safeParse: (data: unknown) => {
        success: boolean
        data?: T
        error?: { message: string }
      }
    },
    options?: ExcelParseOptions,
  ): Promise<ParseResult<T>> {
    const rawResult = await this.parse<Record<string, unknown>>(file, options)

    const data: T[] = []
    const errors: Array<{ row: number; message: string }> = [
      ...rawResult.errors,
    ]

    rawResult.data.forEach((row, index) => {
      const parsed = schema.safeParse(row)
      if (parsed.success && parsed.data) {
        data.push(parsed.data)
      } else {
        errors.push({
          row: index + 2,
          message: parsed.error?.message ?? 'Validacion fallida',
        })
      }
    })

    return {
      data,
      errors,
      meta: {
        totalRows: rawResult.meta.totalRows,
        successfulRows: data.length,
        failedRows: errors.length,
      },
    }
  }

  private getWorksheet(
    workbook: ExcelJS.Workbook,
    options?: ExcelParseOptions,
  ): ExcelJS.Worksheet | undefined {
    if (options?.sheetName) {
      return workbook.getWorksheet(options.sheetName)
    }
    if (options?.sheetIndex !== undefined) {
      return workbook.worksheets[options.sheetIndex]
    }
    return workbook.worksheets[0]
  }

  private getCellValue(value: unknown): unknown {
    if (value == null) return null
    if (typeof value === 'object' && value !== null) {
      // ExcelJS rich text
      if ('richText' in value) {
        return (value as { richText: { text: string }[] }).richText
          .map((r) => r.text)
          .join('')
      }
      // ExcelJS formula result
      if ('result' in value) {
        return (value as { result: unknown }).result
      }
      // ExcelJS hyperlink
      if ('text' in value) {
        return (value as { text: string }).text
      }
    }
    return value
  }
}
