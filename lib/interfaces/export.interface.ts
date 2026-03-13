/**
 * Opciones para exportar PDF.
 */
export interface PDFExportOptions {
  title?: string | undefined
  author?: string | undefined
  orientation?: 'portrait' | 'landscape' | undefined
  pageSize?: 'A4' | 'LETTER' | 'LEGAL' | undefined
}

/**
 * Opciones para exportar Excel.
 */
export interface ExcelExportOptions {
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

/**
 * Interface para servicios de exportacion PDF.
 * Permite cambiar @react-pdf/renderer por pdfkit, puppeteer, etc.
 */
export interface IPDFExportService {
  /**
   * Genera un PDF a partir de datos.
   */
  generate<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string; width?: number }[],
    options?: PDFExportOptions,
  ): Promise<Buffer>

  /**
   * Genera un PDF a partir de un componente React.
   */
  generateFromComponent(
    component: React.ReactElement,
    options?: PDFExportOptions,
  ): Promise<Buffer>
}

/**
 * Interface para servicios de exportacion Excel.
 * Permite cambiar xlsx por exceljs, etc.
 */
export interface IExcelExportService {
  /**
   * Genera un archivo Excel a partir de datos.
   */
  generate<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string; width?: number }[],
    options?: ExcelExportOptions,
  ): Promise<Buffer>

  /**
   * Genera un archivo Excel con multiples hojas.
   */
  generateMultiSheet(
    sheets: Array<{
      name: string
      data: Record<string, unknown>[]
      columns: { key: string; header: string; width?: number }[]
    }>,
    options?: ExcelExportOptions,
  ): Promise<Buffer>
}
