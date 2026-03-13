import * as XLSX from 'xlsx'
import type {
  IExcelImportService,
  ParseResult,
  ExcelParseOptions,
} from '@/lib/interfaces'

/**
 * Implementacion de IExcelImportService usando xlsx (SheetJS).
 * Para cambiar a ExcelJS, crear nuevo adapter.
 */
export class XLSXImportService implements IExcelImportService {
  async parse<T extends Record<string, unknown>>(
    file: Buffer,
    options?: ExcelParseOptions,
  ): Promise<ParseResult<T>> {
    const workbook = XLSX.read(file, { type: 'buffer' })

    // Seleccionar hoja
    let sheetName: string
    if (options?.sheetName) {
      sheetName = options.sheetName
    } else if (options?.sheetIndex !== undefined) {
      sheetName =
        workbook.SheetNames[options.sheetIndex] ?? workbook.SheetNames[0]!
    } else {
      sheetName = workbook.SheetNames[0]!
    }

    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) {
      return {
        data: [],
        errors: [{ row: 0, message: `Hoja "${sheetName}" no encontrada` }],
        meta: { totalRows: 0, successfulRows: 0, failedRows: 0 },
      }
    }

    // Convertir a JSON
    const jsonOptions: XLSX.Sheet2JSONOpts = {
      defval: null,
      blankrows: options?.skipEmptyRows !== false,
    }
    // Solo agregar header si necesitamos cambiar el default
    if (options?.hasHeader === false) {
      jsonOptions.header = 1
    }
    const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, jsonOptions)

    const data: T[] = []
    const errors: Array<{ row: number; message: string }> = []

    jsonData.forEach((row, index) => {
      try {
        data.push(row)
      } catch (error) {
        errors.push({
          row: index + 2, // +2 porque Excel empieza en 1 y tiene header
          message: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    })

    return {
      data,
      errors,
      meta: {
        totalRows: jsonData.length,
        successfulRows: data.length,
        failedRows: errors.length,
      },
    }
  }

  async getSheetNames(file: Buffer): Promise<string[]> {
    const workbook = XLSX.read(file, { type: 'buffer' })
    return workbook.SheetNames
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
}
