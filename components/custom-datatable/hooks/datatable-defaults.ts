import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type {
  CustomColumnDef,
  CustomDataTableProps,
  DensityType,
  ExportFormat,
} from '../types'

export interface DataTablePropsParams<TData> {
  props: CustomDataTableProps<TData>
  visibleColumns: CustomColumnDef<TData>[]
  processedData: TData[]
  currentDensity: DensityType
  isFullscreen: boolean
  selectedCount: number
  bulkActionsContent: React.ReactNode | null
  handleExport: (format: ExportFormat) => void
  handleDensityChange: (density: DensityType) => void
  handleRefresh: () => void
  handleCopy: () => Promise<void>
  handlePrint: () => void
  clearSelection: () => void
  toggleFullscreen: () => void
  isCopyEnabled: boolean | undefined
  isPrintEnabled: boolean | undefined
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

export function useShowToolbar<TData>(props: CustomDataTableProps<TData>) {
  const {
    filter,
    export: exportConfig,
    headerActions,
    toolbar,
    toolbarConfig,
  } = props

  return useMemo(
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
}

export function useContainerClasses(
  isFullscreen: boolean,
  className: string | undefined,
  containerClassName: string | undefined,
  styleMaxHeight: number | undefined,
  styleMinHeight: number | undefined,
) {
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

  const containerStyle = useMemo(() => {
    const styles: React.CSSProperties = {}
    if (styleMaxHeight) styles.maxHeight = styleMaxHeight
    if (styleMinHeight) styles.minHeight = styleMinHeight
    return styles
  }, [styleMaxHeight, styleMinHeight])

  return { containerClass, tableContainerClass, containerStyle }
}

export function useEffectiveStyle(
  style: { density?: DensityType | undefined } | undefined,
  currentDensity: DensityType,
) {
  return useMemo(
    () => ({ ...style, density: currentDensity }),
    [style, currentDensity],
  )
}
