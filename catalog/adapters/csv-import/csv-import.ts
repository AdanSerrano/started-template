import Papa from 'papaparse'
import type {
  ICSVImportService,
  ParseResult,
  CSVParseOptions,
} from '@/lib/interfaces'

/**
 * Implementacion de ICSVImportService usando PapaParse.
 * Para cambiar a csv-parser, crear nuevo adapter.
 */
export class PapaParseCSVImportService implements ICSVImportService {
  async parse<T extends Record<string, unknown>>(
    file: Buffer | string,
    options?: CSVParseOptions,
  ): Promise<ParseResult<T>> {
    const content =
      typeof file === 'string'
        ? file
        : file.toString((options?.encoding as BufferEncoding) ?? 'utf-8')

    return new Promise((resolve) => {
      const data: T[] = []
      const errors: Array<{ row: number; message: string }> = []

      Papa.parse<T>(content, {
        header: options?.hasHeader !== false,
        delimiter: options?.delimiter,
        skipEmptyLines: options?.skipEmptyLines !== false,
        complete: (results) => {
          results.data.forEach((row) => {
            if (row && Object.keys(row).length > 0) {
              data.push(row)
            }
          })

          results.errors.forEach((error) => {
            errors.push({
              row: error.row ?? 0,
              message: error.message,
            })
          })

          resolve({
            data,
            errors,
            meta: {
              totalRows: results.data.length,
              successfulRows: data.length,
              failedRows: errors.length,
            },
          })
        },
        error: (error: Error) => {
          resolve({
            data: [],
            errors: [{ row: 0, message: error.message }],
            meta: { totalRows: 0, successfulRows: 0, failedRows: 1 },
          })
        },
      })
    })
  }

  async parseWithSchema<T>(
    file: Buffer | string,
    schema: {
      safeParse: (data: unknown) => {
        success: boolean
        data?: T
        error?: { message: string }
      }
    },
    options?: CSVParseOptions,
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
          row: index + 2, // +2 para header + 1-indexed
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
