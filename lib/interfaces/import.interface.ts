/**
 * Resultado de parsear un archivo.
 */
export interface ParseResult<T> {
  data: T[]
  errors: Array<{
    row: number
    message: string
  }>
  meta: {
    totalRows: number
    successfulRows: number
    failedRows: number
  }
}

/**
 * Opciones para parsear CSV.
 */
export interface CSVParseOptions {
  delimiter?: string
  hasHeader?: boolean
  skipEmptyLines?: boolean
  encoding?: string
}

/**
 * Opciones para parsear Excel.
 */
export interface ExcelParseOptions {
  sheetIndex?: number
  sheetName?: string
  hasHeader?: boolean
  skipEmptyRows?: boolean
}

/**
 * Interface para servicios de importacion CSV.
 * Permite cambiar papaparse por csv-parser, etc.
 */
export interface ICSVImportService {
  /**
   * Parsea un archivo CSV.
   */
  parse<T extends Record<string, unknown>>(
    file: Buffer | string,
    options?: CSVParseOptions,
  ): Promise<ParseResult<T>>

  /**
   * Parsea un archivo CSV con validacion Zod.
   */
  parseWithSchema<T>(
    file: Buffer | string,
    schema: {
      safeParse: (data: unknown) => {
        success: boolean
        data?: T
        error?: { message: string }
      }
    },
    options?: CSVParseOptions,
  ): Promise<ParseResult<T>>
}

/**
 * Interface para servicios de importacion Excel.
 * Permite cambiar xlsx por exceljs, etc.
 */
export interface IExcelImportService {
  /**
   * Parsea un archivo Excel.
   */
  parse<T extends Record<string, unknown>>(
    file: Buffer,
    options?: ExcelParseOptions,
  ): Promise<ParseResult<T>>

  /**
   * Obtiene los nombres de las hojas de un archivo Excel.
   */
  getSheetNames(file: Buffer): Promise<string[]>

  /**
   * Parsea un archivo Excel con validacion Zod.
   */
  parseWithSchema<T>(
    file: Buffer,
    schema: {
      safeParse: (data: unknown) => {
        success: boolean
        data?: T
        error?: { message: string }
      }
    },
    options?: ExcelParseOptions,
  ): Promise<ParseResult<T>>
}
