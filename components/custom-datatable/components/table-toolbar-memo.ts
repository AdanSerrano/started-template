import type {
  FilterConfig,
  ExportConfig,
  ColumnVisibilityConfig,
  ToolbarConfig,
  CustomColumnDef,
  DensityType,
  ExportFormat,
} from '../types'

export interface TableToolbarProps<TData> {
  filter?: FilterConfig | undefined
  exportConfig?: ExportConfig<TData> | undefined
  onExport?: ((format: ExportFormat) => void) | undefined
  columnVisibility?: ColumnVisibilityConfig | undefined
  columns?: CustomColumnDef<TData>[] | undefined
  selectedCount?: number | undefined
  totalRows?: number | undefined
  bulkActions?: React.ReactNode | undefined
  onClearSelection?: (() => void) | undefined
  headerActions?: React.ReactNode | undefined
  toolbarConfig?: ToolbarConfig | undefined
  density?: DensityType | undefined
  onDensityChange?: ((density: DensityType) => void) | undefined
  onRefresh?: (() => void) | undefined
  isRefreshing?: boolean | undefined
  onCopy?: (() => void) | undefined
  isCopyEnabled?: boolean | undefined
  onPrint?: (() => void) | undefined
  isPrintEnabled?: boolean | undefined
  isFullscreen?: boolean | undefined
  onToggleFullscreen?: (() => void) | undefined
  isFullscreenEnabled?: boolean | undefined
  className?: string | undefined
}

// Custom comparison for toolbar memo
export function areToolbarPropsEqual<TData>(
  prevProps: TableToolbarProps<TData>,
  nextProps: TableToolbarProps<TData>,
): boolean {
  // Fast path: most frequently changing props
  if (prevProps.selectedCount !== nextProps.selectedCount) return false
  if (prevProps.isRefreshing !== nextProps.isRefreshing) return false
  if (prevProps.isFullscreen !== nextProps.isFullscreen) return false
  if (prevProps.density !== nextProps.density) return false

  // Filter state
  if (prevProps.filter?.globalFilter !== nextProps.filter?.globalFilter)
    return false

  // Toolbar config
  if (
    prevProps.toolbarConfig?.showSearch !== nextProps.toolbarConfig?.showSearch
  )
    return false
  if (
    prevProps.toolbarConfig?.showExport !== nextProps.toolbarConfig?.showExport
  )
    return false
  if (
    prevProps.toolbarConfig?.showColumnVisibility !==
    nextProps.toolbarConfig?.showColumnVisibility
  )
    return false
  if (
    prevProps.toolbarConfig?.showDensityToggle !==
    nextProps.toolbarConfig?.showDensityToggle
  )
    return false
  if (
    prevProps.toolbarConfig?.showRefresh !==
    nextProps.toolbarConfig?.showRefresh
  )
    return false
  if (prevProps.toolbarConfig?.showCopy !== nextProps.toolbarConfig?.showCopy)
    return false
  if (prevProps.toolbarConfig?.showPrint !== nextProps.toolbarConfig?.showPrint)
    return false
  if (
    prevProps.toolbarConfig?.showFullscreen !==
    nextProps.toolbarConfig?.showFullscreen
  )
    return false

  // Enable flags
  if (prevProps.isCopyEnabled !== nextProps.isCopyEnabled) return false
  if (prevProps.isPrintEnabled !== nextProps.isPrintEnabled) return false
  if (prevProps.isFullscreenEnabled !== nextProps.isFullscreenEnabled)
    return false
  if (prevProps.exportConfig?.enabled !== nextProps.exportConfig?.enabled)
    return false
  if (
    prevProps.columnVisibility?.enabled !== nextProps.columnVisibility?.enabled
  )
    return false

  // Column visibility state
  if (
    prevProps.columnVisibility?.columnVisibility !==
    nextProps.columnVisibility?.columnVisibility
  )
    return false

  // Class names
  if (prevProps.className !== nextProps.className) return false

  // Columns reference
  if (prevProps.columns !== nextProps.columns) return false

  // Callbacks (should be stable)
  if (prevProps.onExport !== nextProps.onExport) return false
  if (prevProps.onDensityChange !== nextProps.onDensityChange) return false
  if (prevProps.onRefresh !== nextProps.onRefresh) return false
  if (prevProps.onCopy !== nextProps.onCopy) return false
  if (prevProps.onPrint !== nextProps.onPrint) return false
  if (prevProps.onToggleFullscreen !== nextProps.onToggleFullscreen)
    return false
  if (prevProps.onClearSelection !== nextProps.onClearSelection) return false

  // ReactNode comparisons (reference equality)
  if (prevProps.bulkActions !== nextProps.bulkActions) return false
  if (prevProps.headerActions !== nextProps.headerActions) return false

  return true
}
