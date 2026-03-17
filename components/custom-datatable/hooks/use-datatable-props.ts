import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type {
  CustomColumnDef,
  CustomDataTableProps,
  DensityType,
  ExportFormat,
} from '../types'

interface UseDataTablePropsParams<TData> {
  props: CustomDataTableProps<TData>
  visibleColumns: CustomColumnDef<TData>[]
  processedData: TData[]
  currentDensity: DensityType
  isFullscreen: boolean
  selectedCount: number
  bulkActionsContent: React.ReactNode | null
  // Handlers
  handleExport: (format: ExportFormat) => void
  handleDensityChange: (density: DensityType) => void
  handleRefresh: () => void
  handleCopy: () => Promise<void>
  handlePrint: () => void
  clearSelection: () => void
  toggleFullscreen: () => void
  isCopyEnabled: boolean | undefined
  isPrintEnabled: boolean | undefined
  // State from useDataTableState
  selectionState: Record<string, boolean>
  expansionState: Record<string, boolean>
  toggleRowSelection: (rowId: string) => void
  toggleRowExpansion: (rowId: string) => void
  toggleSort: (columnId: string) => void
  getSortDirection: (columnId: string) => 'asc' | 'desc' | false
  isAllSelected: boolean
  isSomeSelected: boolean
  selectAllRows: () => void
}

export function useDataTableMemoizedProps<TData>({
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
}: UseDataTablePropsParams<TData>) {
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
    className,
    containerClassName,
    headerClassName,
    bodyClassName,
    rowClassName,
    paginationClassName,
    toolbarClassName,
    fullscreen: fullscreenConfig,
  } = props

  const showExpander = expansion?.enabled ?? false

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

  const effectiveStyle = useMemo(
    () => ({
      ...style,
      density: currentDensity,
    }),
    [style, currentDensity],
  )

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

  const paginationProps = useMemo(() => {
    if (!pagination) return null
    return {
      pagination,
      selectedCount,
      totalRows: pagination.totalRows ?? 0,
      className: paginationClassName,
    }
  }, [pagination, selectedCount, paginationClassName])

  const containerClass = useMemo(
    () =>
      cn(
        'w-full',
        isFullscreen && 'fixed inset-0 z-50 bg-background p-4 overflow-auto',
        className,
      ),
    [isFullscreen, className],
  )

  const tableContainerClass = useMemo(
    () => cn('relative overflow-auto rounded-md border', containerClassName),
    [containerClassName],
  )

  const styleMaxHeight = style?.maxHeight
  const styleMinHeight = style?.minHeight
  const containerStyle = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (styleMaxHeight) styles.maxHeight = styleMaxHeight
    if (styleMinHeight) styles.minHeight = styleMinHeight
    return styles
  }, [styleMaxHeight, styleMinHeight])

  return {
    showToolbar,
    toolbarProps,
    headerProps,
    bodyProps,
    paginationProps,
    containerClass,
    tableContainerClass,
    containerStyle,
  }
}
