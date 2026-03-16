'use client'

import {
  forwardRef,
  useEffect,
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
import { useDataTableRefs } from './hooks/use-datatable-refs'
import { useDataTableMemoizedProps } from './hooks/use-datatable-props'
import type {
  CustomDataTableProps,
  CustomDataTableRef,
  DensityType,
  ExportFormat,
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
    columnVisibility,
    style,
    export: exportConfig,
    isLoading,
    isPending,
    toolbar,
    toolbarConfig,
    bulkActions,
    footer,
    copy: copyConfig,
    print: printConfig,
    fullscreen: fullscreenConfig,
  } = props

  const tableRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [internalDensity, setInternalDensity] = useState<DensityType>(
    style?.density ?? 'default',
  )
  const currentDensity = internalDensity

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

  const selectionSelectedRows = selection?.selectedRows
  const selectedRowsSet = useMemo(() => {
    if (!selectionSelectedRows) return undefined
    return new Set(
      Object.keys(selectionSelectedRows).filter(
        (k) => selectionSelectedRows[k],
      ),
    )
  }, [selectionSelectedRows])

  const onExportFn = exportConfig?.onExport
  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExportFn?.(format, processedData)
    },
    [onExportFn, processedData],
  )

  const handleDensityChange = useCallback((density: DensityType) => {
    setInternalDensity(density)
  }, [])

  const toolbarConfigRef = useRef(toolbarConfig)
  useEffect(() => {
    toolbarConfigRef.current = toolbarConfig
  }, [toolbarConfig])

  const handleRefresh = useCallback(() => {
    toolbarConfigRef.current?.onRefresh?.()
  }, [])

  const { copyAll, isCopyEnabled } = useCopyClipboard({
    enabled: copyConfig?.enabled ?? false,
    config: copyConfig,
    data: processedData,
    columns: visibleColumns,
    selectedRows: selectedRowsSet,
    getRowId,
  })

  const { printAll, isPrintEnabled } = usePrint({
    enabled: printConfig?.enabled ?? false,
    config: printConfig,
    data: processedData,
    columns: visibleColumns,
    title: printConfig?.title,
    style,
  })

  const handleCopy = useCallback(async () => {
    const success = await copyAll()
    if (success) {
      toast.success('Datos copiados al portapapeles')
    } else {
      toast.error('Error al copiar datos')
    }
  }, [copyAll])

  const handlePrint = useCallback(() => {
    printAll()
  }, [printAll])

  useDataTableRefs({
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
  })

  const bulkActionsContent = useMemo(() => {
    if (!bulkActions || selectedCount === 0) return null
    return bulkActions(getSelectedRows())
  }, [bulkActions, selectedCount, getSelectedRows])

  const {
    showToolbar,
    toolbarProps,
    headerProps,
    bodyProps,
    paginationProps,
    containerClass,
    tableContainerClass,
    containerStyle,
  } = useDataTableMemoizedProps({
    props,
    visibleColumns,
    processedData,
    currentDensity,
    isFullscreen,
    selectedCount,
    bulkActionsContent,
    handleExport,
    handleDensityChange,
    handleRefresh,
    handleCopy,
    handlePrint,
    clearSelection,
    toggleFullscreen,
    isCopyEnabled,
    isPrintEnabled,
    selectionState,
    expansionState,
    toggleRowSelection,
    toggleRowExpansion,
    toggleSort,
    getSortDirection,
    isAllSelected,
    isSomeSelected,
    selectAllRows,
  })

  return (
    <div ref={containerRef} className={containerClass}>
      {showToolbar && (
        <>{toolbar ?? <CustomTableToolbar {...toolbarProps} />}</>
      )}

      <div
        ref={tableRef}
        className={tableContainerClass}
        style={containerStyle}
        tabIndex={0}
        role="region"
        aria-label={props.ariaLabel ?? 'Tabla de datos'}
        aria-busy={isLoading || isPending}
      >
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

      {paginationProps && <CustomTablePagination {...paginationProps} />}

      {footer}
    </div>
  )
}

export const CustomDataTable = forwardRef(CustomDataTableInner) as <TData>(
  props: CustomDataTableProps<TData> & {
    ref?: React.ForwardedRef<CustomDataTableRef<TData>>
  },
) => React.ReactElement
