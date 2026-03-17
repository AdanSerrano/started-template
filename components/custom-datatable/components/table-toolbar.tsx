'use client'

import { RefreshCw, Copy, Printer, Maximize, Minimize } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useRef, useMemo } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  TooltipButton,
  SearchInput,
  DensityDropdown,
  ColumnVisibilityDropdown,
  ExportDropdown,
  BulkActionsBar,
} from './table-toolbar-controls'
import { areToolbarPropsEqual } from './table-toolbar-memo'
import { useToolbarFilter, useToolbarActions } from './toolbar-filters'
import type { TableToolbarProps } from './table-toolbar-memo'
import type { DensityType, ExportFormat } from '../types'

function TableToolbarInner<TData>({
  filter,
  exportConfig,
  onExport,
  columnVisibility,
  columns = [],
  selectedCount = 0,
  bulkActions,
  onClearSelection,
  headerActions,
  toolbarConfig,
  density = 'default',
  onDensityChange,
  onRefresh,
  isRefreshing = false,
  onCopy,
  isCopyEnabled = false,
  onPrint,
  isPrintEnabled = false,
  isFullscreen = false,
  onToggleFullscreen,
  isFullscreenEnabled = false,
  className,
}: TableToolbarProps<TData>) {
  const t = useTranslations('DataTable.toolbar')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const {
    externalFilter,
    handleFilterChange,
    handleClearFilter,
    handleSubmitFilter,
  } = useToolbarFilter({ filter, inputRef })

  const { handleExport, handleColumnVisibilityChange } = useToolbarActions({
    onExport,
    exportConfig,
    columnVisibility,
  })

  const handleDensityChange = useCallback(
    (newDensity: DensityType) => {
      onDensityChange?.(newDensity)
    },
    [onDensityChange],
  )

  const hideableColumnsInfo = useMemo(
    () =>
      columns
        .filter((col) => col.enableHiding !== false)
        .map((col) => ({
          id: col.id,
          header: typeof col.header === 'string' ? col.header : col.id,
        })),
    [columns],
  )

  const hasSelection = selectedCount > 0
  const showFlags = useMemo(
    () => ({
      search: toolbarConfig?.showSearch ?? true,
      export: toolbarConfig?.showExport ?? exportConfig?.enabled ?? false,
      columnVisibility:
        toolbarConfig?.showColumnVisibility ??
        columnVisibility?.enabled ??
        false,
      densityToggle: toolbarConfig?.showDensityToggle ?? false,
      refresh: toolbarConfig?.showRefresh ?? false,
      copy: toolbarConfig?.showCopy ?? isCopyEnabled,
      print: toolbarConfig?.showPrint ?? isPrintEnabled,
      fullscreen: toolbarConfig?.showFullscreen ?? isFullscreenEnabled,
    }),
    [
      toolbarConfig?.showSearch,
      toolbarConfig?.showExport,
      toolbarConfig?.showColumnVisibility,
      toolbarConfig?.showDensityToggle,
      toolbarConfig?.showRefresh,
      toolbarConfig?.showCopy,
      toolbarConfig?.showPrint,
      toolbarConfig?.showFullscreen,
      exportConfig?.enabled,
      columnVisibility?.enabled,
      isCopyEnabled,
      isPrintEnabled,
      isFullscreenEnabled,
    ],
  )

  const exportFormats = useMemo(
    () => exportConfig?.formats ?? (['csv', 'json', 'xlsx'] as ExportFormat[]),
    [exportConfig?.formats],
  )

  const searchPlaceholder = filter?.placeholder ?? t('search')
  const showClearButton = filter?.showClearButton ?? true

  const densityLabels = useMemo(
    () => ({
      density: t('density'),
      densityRows: t('densityRows'),
      compact: t('densityCompact'),
      default: t('densityDefault'),
      comfortable: t('densityComfortable'),
    }),
    [t],
  )
  const columnLabels = useMemo(
    () => ({
      columns: t('columns'),
      showHideColumns: t('showHideColumns'),
      visibleColumns: t('visibleColumns'),
    }),
    [t],
  )
  const exportLabels = useMemo(
    () => ({ export: t('export'), exportFormat: t('exportFormat') }),
    [t],
  )
  const bulkLabels = useMemo(
    () => ({
      selected: t('selected'),
      selectedPlural: t('selectedPlural'),
      clearSelection: t('clearSelection'),
    }),
    [t],
  )

  const containerClass = useMemo(
    () => cn('flex flex-col gap-4 py-4', className),
    [className],
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className={containerClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            {toolbarConfig?.customStart}
            {filter && showFlags.search && (
              <SearchInput
                inputRef={inputRef}
                defaultValue={externalFilter}
                placeholder={searchPlaceholder}
                onChange={handleFilterChange}
                onClear={handleClearFilter}
                onSubmit={handleSubmitFilter}
                showClearButton={showClearButton}
                clearLabel={t('clearSearch')}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {showFlags.fullscreen && onToggleFullscreen && (
              <TooltipButton
                onClick={onToggleFullscreen}
                icon={isFullscreen ? Minimize : Maximize}
                tooltip={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
              />
            )}
            {showFlags.copy && onCopy && (
              <TooltipButton onClick={onCopy} icon={Copy} tooltip={t('copy')} />
            )}
            {showFlags.print && onPrint && (
              <TooltipButton
                onClick={onPrint}
                icon={Printer}
                tooltip={t('print')}
              />
            )}
            {showFlags.refresh && onRefresh && (
              <TooltipButton
                onClick={onRefresh}
                disabled={isRefreshing}
                icon={RefreshCw}
                tooltip={t('refresh')}
                iconClassName={isRefreshing ? 'animate-spin' : undefined}
              />
            )}
            {showFlags.densityToggle && onDensityChange && (
              <DensityDropdown
                currentDensity={density}
                onDensityChange={handleDensityChange}
                labels={densityLabels}
              />
            )}
            {showFlags.columnVisibility &&
              hideableColumnsInfo.length > 0 &&
              columnVisibility && (
                <ColumnVisibilityDropdown
                  columns={hideableColumnsInfo}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                  labels={columnLabels}
                />
              )}
            {showFlags.export && (
              <ExportDropdown
                formats={exportFormats}
                onExport={handleExport}
                labels={exportLabels}
              />
            )}
            {toolbarConfig?.customEnd}
          </div>
        </div>
        {hasSelection && bulkActions && onClearSelection && (
          <BulkActionsBar
            selectedCount={selectedCount}
            bulkActions={bulkActions}
            onClearSelection={onClearSelection}
            labels={bulkLabels}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

export const CustomTableToolbar = memo(
  TableToolbarInner,
  areToolbarPropsEqual,
) as typeof TableToolbarInner
