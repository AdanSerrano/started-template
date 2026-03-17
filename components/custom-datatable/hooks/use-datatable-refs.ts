import { useEffect, useImperativeHandle, useRef } from 'react'
import type {
  CustomDataTableProps,
  CustomDataTableRef,
  CustomColumnDef,
  ColumnVisibilityState,
  ExportFormat,
} from '../types'

interface UseDataTableRefsParams<TData> {
  ref: React.ForwardedRef<CustomDataTableRef<TData>>
  tableRef: React.RefObject<HTMLDivElement | null>
  props: CustomDataTableProps<TData>
  processedData: TData[]
  visibleColumns: CustomColumnDef<TData>[]
  // State actions
  setGlobalFilter: (filter: string) => void
  selectAllRows: () => void
  clearSelection: () => void
  toggleRowSelection: (rowId: string) => void
  expandAllRows: () => void
  collapseAllRows: () => void
  toggleRowExpansion: (rowId: string) => void
  getSelectedRows: () => TData[]
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function useDataTableRefs<TData>({
  ref,
  tableRef,
  props,
  processedData,
  visibleColumns,
  setGlobalFilter,
  selectAllRows,
  clearSelection,
  toggleRowSelection,
  expandAllRows,
  collapseAllRows,
  toggleRowExpansion,
  getSelectedRows,
  goToPage,
  setPageSize,
}: UseDataTableRefsParams<TData>) {
  const {
    data,
    columns,
    getRowId,
    sorting,
    selection,
    expansion,
    pagination,
    columnVisibility,
    export: exportConfig,
  } = props

  // Refs for imperative handle to avoid dependency changes
  const stateRef = useRef({
    data,
    processedData,
    columns,
    visibleColumns,
    exportConfig,
    sorting,
    selection,
    expansion,
    pagination,
    columnVisibility,
  })

  useEffect(() => {
    stateRef.current = {
      data,
      processedData,
      columns,
      visibleColumns,
      exportConfig,
      sorting,
      selection,
      expansion,
      pagination,
      columnVisibility,
    }
  }, [
    data,
    processedData,
    columns,
    visibleColumns,
    exportConfig,
    sorting,
    selection,
    expansion,
    pagination,
    columnVisibility,
  ])

  useImperativeHandle(
    ref,
    () => ({
      scrollToRow: (index: number) => {
        const row = tableRef.current?.querySelector(
          `[data-row-index="${index}"]`,
        )
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      },
      scrollToTop: () => {
        tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      },
      scrollToBottom: () => {
        if (tableRef.current) {
          tableRef.current.scrollTo({
            top: tableRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }
      },
      exportData: (format: ExportFormat) => {
        stateRef.current.exportConfig?.onExport?.(
          format,
          stateRef.current.processedData,
        )
      },
      resetFilters: () => {
        setGlobalFilter('')
      },
      setGlobalFilter,
      resetSorting: () => {
        stateRef.current.sorting?.onSortingChange?.([])
      },
      setSorting: (newSorting) => {
        stateRef.current.sorting?.onSortingChange?.(newSorting)
      },
      selectAll: selectAllRows,
      clearSelection,
      selectRows: (rowIds: string[]) => {
        const newSelection: Record<string, boolean> = {}
        rowIds.forEach((id) => {
          newSelection[id] = true
        })
        stateRef.current.selection?.onSelectionChange?.(newSelection)
      },
      toggleRowSelection,
      getSelectedRows,
      getSelectedRowIds: () => {
        const sel = stateRef.current.selection?.selectedRows ?? {}
        return Object.keys(sel).filter((id) => sel[id])
      },
      expandAll: expandAllRows,
      collapseAll: collapseAllRows,
      expandRows: (rowIds: string[]) => {
        const newExpansion: Record<string, boolean> = {}
        rowIds.forEach((id) => {
          newExpansion[id] = true
        })
        stateRef.current.expansion?.onExpansionChange?.(newExpansion)
      },
      toggleRowExpansion,
      setColumnVisibility: (visibility: ColumnVisibilityState) => {
        stateRef.current.columnVisibility?.onColumnVisibilityChange?.(
          visibility,
        )
      },
      toggleColumnVisibility: (columnId: string) => {
        const cv = stateRef.current.columnVisibility
        if (!cv) return
        const current = cv.columnVisibility[columnId] ?? true
        cv.onColumnVisibilityChange?.({
          ...cv.columnVisibility,
          [columnId]: !current,
        })
      },
      showAllColumns: () => {
        const allVisible: ColumnVisibilityState = {}
        stateRef.current.columns.forEach((col) => {
          allVisible[col.id] = true
        })
        stateRef.current.columnVisibility?.onColumnVisibilityChange?.(
          allVisible,
        )
      },
      hideColumn: (columnId: string) => {
        const cv = stateRef.current.columnVisibility
        cv?.onColumnVisibilityChange?.({
          ...cv.columnVisibility,
          [columnId]: false,
        })
      },
      getVisibleColumns: () =>
        stateRef.current.visibleColumns.map((col) => col.id),
      goToPage,
      goToFirstPage: () => goToPage(0),
      goToLastPage: () => {
        const totalPages = stateRef.current.pagination?.totalPages ?? 1
        goToPage(totalPages - 1)
      },
      nextPage: () => {
        const pageIndex = stateRef.current.pagination?.pageIndex ?? 0
        goToPage(pageIndex + 1)
      },
      previousPage: () => {
        const pageIndex = stateRef.current.pagination?.pageIndex ?? 0
        goToPage(Math.max(0, pageIndex - 1))
      },
      setPageSize,
      getVisibleData: () => stateRef.current.processedData,
      getFilteredData: () => stateRef.current.processedData,
      getAllData: () => stateRef.current.data,
      getRowById: (id: string) =>
        stateRef.current.data.find((row) => getRowId(row) === id),
      focusTable: () => tableRef.current?.focus(),
      focusRow: (index: number) => {
        const row = tableRef.current?.querySelector(
          `[data-row-index="${index}"]`,
        ) as HTMLElement
        row?.focus()
      },
    }),
    [
      setGlobalFilter,
      selectAllRows,
      clearSelection,
      toggleRowSelection,
      expandAllRows,
      collapseAllRows,
      toggleRowExpansion,
      getSelectedRows,
      goToPage,
      setPageSize,
      getRowId,
      tableRef,
    ],
  )
}
