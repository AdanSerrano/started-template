'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { toast } from 'sonner'

import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Table } from '@/components/ui/table'

import { CustomTableHeader } from './components/table-header'
import { CustomTableBody } from './components/table-body'
import { CustomTablePagination } from './components/table-pagination'
import { CustomTableToolbar } from './components/table-toolbar'
import { useDataTableState } from './hooks/use-datatable-state'
import { useFullscreen } from './hooks/use-fullscreen'
import { useCopyClipboard } from './hooks/use-copy-clipboard'
import { usePrint } from './hooks/use-print'
import type {
  CustomDataTableProps,
  CustomDataTableRef,
  DensityType,
  ExportFormat,
  ColumnVisibilityState,
} from './types'

function CustomDataTableInner<TData>(
  props: CustomDataTableProps<TData>,
  ref: React.ForwardedRef<CustomDataTableRef<TData>>,
) {
  const {
    data,
    columns,
    getRowId,
    selection,
    expansion,
    pagination,
    sorting,
    filter,
    columnVisibility,
    style,
    export: exportConfig,
    isLoading,
    isPending,
    emptyMessage,
    emptyIcon,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    toolbar,
    toolbarConfig,
    headerActions,
    bulkActions,
    footer,
    className,
    containerClassName,
    headerClassName,
    bodyClassName,
    rowClassName,
    paginationClassName,
    toolbarClassName,
    copy: copyConfig,
    print: printConfig,
    fullscreen: fullscreenConfig,
  } = props

  const tableRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal density state - toolbar changes this, initial value from style.density
  const [internalDensity, setInternalDensity] = useState<DensityType>(
    style?.density ?? 'default',
  )

  // Use internal density (controlled by toolbar)
  const currentDensity = internalDensity

  // Fullscreen hook
  const { isFullscreen, toggleFullscreen } = useFullscreen({
    enabled: fullscreenConfig?.enabled ?? false,
    config: fullscreenConfig,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  })

  const {
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    selectionState,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    getSelectedRows,
    toggleRowExpansion,
    expandAllRows,
    collapseAllRows,
    expansionState,
    toggleSort,
    getSortDirection,
    goToPage,
    setPageSize,
    setGlobalFilter,
    processedData,
  } = useDataTableState(props)

  // Filter visible columns - memoized with stable reference
  const columnVisibilityEnabled = columnVisibility?.enabled
  const columnVisibilityMap = columnVisibility?.columnVisibility
  const visibleColumns = useMemo(() => {
    if (!columnVisibilityEnabled) return columns
    return columns.filter((col) => {
      const isVisible = columnVisibilityMap?.[col.id]
      if (isVisible === undefined) return !col.defaultHidden
      return isVisible
    })
  }, [columns, columnVisibilityEnabled, columnVisibilityMap])

  // Memoize selected rows set for copy hook
  const selectionSelectedRows = selection?.selectedRows
  const selectedRowsSet = useMemo(() => {
    if (!selectionSelectedRows) return undefined
    return new Set(
      Object.keys(selectionSelectedRows).filter(
        (k) => selectionSelectedRows[k],
      ),
    )
  }, [selectionSelectedRows])

  // Handle export - stable callback
  const onExportFn = exportConfig?.onExport
  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExportFn?.(format, processedData)
    },
    [onExportFn, processedData],
  )

  // Handle density change - stable callback
  const handleDensityChange = useCallback((density: DensityType) => {
    setInternalDensity(density)
  }, [])

  // Handle refresh - stable callback using ref
  const toolbarConfigRef = useRef(toolbarConfig)
  useEffect(() => {
    toolbarConfigRef.current = toolbarConfig
  }, [toolbarConfig])

  const handleRefresh = useCallback(() => {
    toolbarConfigRef.current?.onRefresh?.()
  }, [])

  // Copy hook with memoized inputs
  const { copyAll, isCopyEnabled } = useCopyClipboard({
    enabled: copyConfig?.enabled ?? false,
    config: copyConfig,
    data: processedData,
    columns: visibleColumns,
    selectedRows: selectedRowsSet,
    getRowId,
  })

  // Print hook with memoized inputs
  const { printAll, isPrintEnabled } = usePrint({
    enabled: printConfig?.enabled ?? false,
    config: printConfig,
    data: processedData,
    columns: visibleColumns,
    title: printConfig?.title,
    style,
  })

  // Handle copy - stable callback
  const handleCopy = useCallback(async () => {
    const success = await copyAll()
    if (success) {
      toast.success('Datos copiados al portapapeles')
    } else {
      toast.error('Error al copiar datos')
    }
  }, [copyAll])

  // Handle print - stable callback
  const handlePrint = useCallback(() => {
    printAll()
  }, [printAll])

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

  // Ref methods - stable with refs
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
    ],
  )

  // Calculate max height style - memoized
  const styleMaxHeight = style?.maxHeight
  const styleMinHeight = style?.minHeight
  const containerStyle = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (styleMaxHeight) styles.maxHeight = styleMaxHeight
    if (styleMinHeight) styles.minHeight = styleMinHeight
    return styles
  }, [styleMaxHeight, styleMinHeight])

  // Get bulk actions content - memoized
  const bulkActionsContent = useMemo(() => {
    if (!bulkActions || selectedCount === 0) return null
    return bulkActions(getSelectedRows())
  }, [bulkActions, selectedCount, getSelectedRows])

  // Show expander column - memoized boolean
  const showExpander = expansion?.enabled ?? false

  // Determine if toolbar should show - memoized
  const showToolbar = useMemo(
    () =>
      toolbarConfig?.show !== false &&
      (filter ||
        exportConfig?.enabled ||
        headerActions ||
        toolbar ||
        toolbarConfig?.showColumnVisibility ||
        toolbarConfig?.showDensityToggle ||
        toolbarConfig?.showRefresh ||
        toolbarConfig?.showCopy ||
        toolbarConfig?.showPrint ||
        toolbarConfig?.showFullscreen),
    [
      toolbarConfig?.show,
      toolbarConfig?.showColumnVisibility,
      toolbarConfig?.showDensityToggle,
      toolbarConfig?.showRefresh,
      toolbarConfig?.showCopy,
      toolbarConfig?.showPrint,
      toolbarConfig?.showFullscreen,
      filter,
      exportConfig?.enabled,
      headerActions,
      toolbar,
    ],
  )

  // Merge style with current density - memoized
  const effectiveStyle = useMemo(
    () => ({
      ...style,
      density: currentDensity,
    }),
    [style, currentDensity],
  )

  // Memoized toolbar props to prevent re-renders
  const toolbarProps = useMemo(
    () => ({
      filter,
      exportConfig,
      onExport: handleExport,
      columnVisibility,
      columns,
      selectedCount,
      totalRows: pagination?.totalRows ?? data.length,
      bulkActions: bulkActionsContent,
      headerActions,
      onClearSelection: clearSelection,
      toolbarConfig,
      density: currentDensity,
      onDensityChange: handleDensityChange,
      onRefresh: toolbarConfig?.onRefresh ? handleRefresh : undefined,
      isRefreshing: isPending,
      onCopy: isCopyEnabled ? handleCopy : undefined,
      isCopyEnabled,
      onPrint: isPrintEnabled ? handlePrint : undefined,
      isPrintEnabled,
      isFullscreen,
      onToggleFullscreen: fullscreenConfig?.enabled
        ? toggleFullscreen
        : undefined,
      isFullscreenEnabled: fullscreenConfig?.enabled ?? false,
      className: toolbarClassName,
    }),
    [
      filter,
      exportConfig,
      handleExport,
      columnVisibility,
      columns,
      selectedCount,
      pagination?.totalRows,
      data.length,
      bulkActionsContent,
      headerActions,
      clearSelection,
      toolbarConfig,
      currentDensity,
      handleDensityChange,
      handleRefresh,
      isPending,
      isCopyEnabled,
      handleCopy,
      isPrintEnabled,
      handlePrint,
      isFullscreen,
      fullscreenConfig?.enabled,
      toggleFullscreen,
      toolbarClassName,
    ],
  )

  // Memoized header props
  const headerProps = useMemo(
    () => ({
      columns: visibleColumns,
      selection,
      showExpander,
      sorting: sorting?.sorting,
      onSort: toggleSort,
      getSortDirection,
      isAllSelected,
      isSomeSelected,
      onSelectAll: selectAllRows,
      onClearSelection: clearSelection,
      stickyHeader: style?.stickyHeader,
      className: headerClassName,
    }),
    [
      visibleColumns,
      selection,
      showExpander,
      sorting?.sorting,
      toggleSort,
      getSortDirection,
      isAllSelected,
      isSomeSelected,
      selectAllRows,
      clearSelection,
      style?.stickyHeader,
      headerClassName,
    ],
  )

  // Memoized body props - uses state objects for optimized row rendering
  const bodyProps = useMemo(
    () => ({
      data: processedData,
      columns: visibleColumns,
      getRowId,
      selection,
      expansion,
      style: effectiveStyle,
      isLoading,
      isPending,
      emptyMessage,
      emptyIcon,
      selectionState,
      expansionState,
      onToggleSelection: toggleRowSelection,
      onToggleExpansion: toggleRowExpansion,
      onRowClick,
      onRowDoubleClick,
      onRowContextMenu,
      rowClassName,
      pageSize: pagination?.pageSize ?? 10,
      className: bodyClassName,
    }),
    [
      processedData,
      visibleColumns,
      getRowId,
      selection,
      expansion,
      effectiveStyle,
      isLoading,
      isPending,
      emptyMessage,
      emptyIcon,
      selectionState,
      expansionState,
      toggleRowSelection,
      toggleRowExpansion,
      onRowClick,
      onRowDoubleClick,
      onRowContextMenu,
      rowClassName,
      pagination?.pageSize,
      bodyClassName,
    ],
  )

  // Memoized pagination props - only create when pagination exists
  const paginationProps = useMemo(() => {
    if (!pagination) return null
    return {
      pagination,
      selectedCount,
      totalRows: pagination.totalRows ?? 0,
      className: paginationClassName,
    }
  }, [pagination, selectedCount, paginationClassName])

  // Container class - memoized
  const containerClass = useMemo(
    () =>
      cn(
        'w-full',
        isFullscreen && 'fixed inset-0 z-50 bg-background p-4 overflow-auto',
        className,
      ),
    [isFullscreen, className],
  )

  // Table container class - memoized
  const tableContainerClass = useMemo(
    () => cn('relative overflow-auto rounded-md border', containerClassName),
    [containerClassName],
  )

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Toolbar */}
      {showToolbar && (
        <>{toolbar ?? <CustomTableToolbar {...toolbarProps} />}</>
      )}

      {/* Table */}
      <div
        ref={tableRef}
        className={tableContainerClass}
        style={containerStyle}
        tabIndex={0}
        role="region"
        aria-label={props.ariaLabel ?? 'Tabla de datos'}
        aria-busy={isLoading || isPending}
      >
        {/* Loading indicator - minimally intrusive with smooth animation */}
        <div
          className={cn(
            'absolute top-2 right-2 z-10 transition-all duration-200 ease-out',
            isPending && !isLoading
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-2 opacity-0',
          )}
          role="status"
          aria-live="polite"
        >
          <div className="bg-primary/10 border-primary/20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-xs backdrop-blur-xs">
            <Loader2
              className="text-primary h-3 w-3 animate-spin"
              aria-hidden="true"
            />
            <span className="text-primary text-xs font-medium">
              {props.isLoading ? undefined : 'Actualizando'}
            </span>
          </div>
        </div>
        <Table
          aria-label={props.ariaLabel ?? 'Tabla de datos'}
          aria-rowcount={pagination?.totalRows ?? data.length}
        >
          <CustomTableHeader {...headerProps} />
          <CustomTableBody {...bodyProps} />
        </Table>
      </div>

      {/* Pagination */}
      {paginationProps && <CustomTablePagination {...paginationProps} />}

      {/* Footer */}
      {footer}
    </div>
  )
}

// Create a typed forwardRef component
export const CustomDataTable = forwardRef(CustomDataTableInner) as <TData>(
  props: CustomDataTableProps<TData> & {
    ref?: React.ForwardedRef<CustomDataTableRef<TData>>
  },
) => React.ReactElement
