import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import { createElement } from 'react'
import type { IPDFExportService, PDFExportOptions } from '@/lib/interfaces'

/**
 * Convierte el pageSize de la interfaz al tipo esperado por @react-pdf/renderer.
 */
function toPageSize(
  size?: 'A4' | 'LETTER' | 'LEGAL',
): 'A4' | 'LETTER' | 'LEGAL' {
  return size ?? 'A4'
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
})

/**
 * Implementacion de IPDFExportService usando @react-pdf/renderer.
 * Para cambiar a pdfkit, puppeteer, etc., crear nuevo adapter.
 */
export class ReactPDFExportService implements IPDFExportService {
  async generate<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string; width?: number }[],
    options?: PDFExportOptions,
  ): Promise<Buffer> {
    const totalWidth = columns.reduce((acc, col) => acc + (col.width ?? 100), 0)

    const TableDocument = createElement(
      Document,
      null,
      createElement(
        Page,
        {
          size: toPageSize(options?.pageSize),
          orientation: options?.orientation ?? 'portrait',
          style: styles.page,
        },
        // Title
        options?.title &&
          createElement(Text, { style: styles.title }, options.title),

        // Table
        createElement(
          View,
          { style: styles.table },
          // Header row
          createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            columns.map((col, i) =>
              createElement(
                View,
                {
                  key: String(col.key),
                  style: [
                    styles.tableCell,
                    { width: `${((col.width ?? 100) / totalWidth) * 100}%` },
                    ...(i === columns.length - 1 ? [styles.tableCellLast] : []),
                  ],
                },
                createElement(Text, { style: styles.headerText }, col.header),
              ),
            ),
          ),
          // Data rows
          data.map((row, rowIndex) =>
            createElement(
              View,
              { key: rowIndex, style: styles.tableRow },
              columns.map((col, colIndex) =>
                createElement(
                  View,
                  {
                    key: String(col.key),
                    style: [
                      styles.tableCell,
                      { width: `${((col.width ?? 100) / totalWidth) * 100}%` },
                      ...(colIndex === columns.length - 1
                        ? [styles.tableCellLast]
                        : []),
                    ],
                  },
                  createElement(Text, null, String(row[col.key] ?? '')),
                ),
              ),
            ),
          ),
        ),

        // Footer
        createElement(
          Text,
          { style: styles.footer },
          `Generado por Starter App - ${new Date().toLocaleDateString('es-ES')}`,
        ),
      ),
    )

    const pdfBlob = await pdf(TableDocument).toBlob()
    const arrayBuffer = await pdfBlob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async generateFromComponent(
    component: React.ReactElement,
    options?: PDFExportOptions,
  ): Promise<Buffer> {
    const WrappedDocument = createElement(
      Document,
      null,
      createElement(
        Page,
        {
          size: toPageSize(options?.pageSize),
          orientation: options?.orientation ?? 'portrait',
          style: styles.page,
        },
        component,
      ),
    )

    const pdfBlob = await pdf(WrappedDocument).toBlob()
    const arrayBuffer = await pdfBlob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}
