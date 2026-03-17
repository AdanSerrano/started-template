'use client'

import { RefreshCw, Copy, Printer, Maximize, Minimize } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useRef, useMemo, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { DEFAULT_FILTER_DEBOUNCE_MS } from '../constants'
import {
  TooltipButton,
  SearchInput,
  DensityDropdown,
  ColumnVisibilityDropdown,
  ExportDropdown,
  BulkActionsBar,
} from './table-toolbar-controls'
import { areToolbarPropsEqual } from './table-toolbar-memo'
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localFilterRef = useRef(filter?.globalFilter ?? '')

  const filterRef = useRef(filter)
  const onExportRef = useRef(onExport)
  const exportConfigRef = useRef(exportConfig)
  const columnVisibilityRef = useRef(columnVisibility)

  useEffect(() => {
    filterRef.current = filter
    onExportRef.current = onExport
    exportConfigRef.current = exportConfig
    columnVisibilityRef.current = columnVisibility
  }, [filter, onExport, exportConfig, columnVisibility])

  const externalFilter = filter?.globalFilter ?? ''

  useEffect(() => {
    if (
      localFilterRef.current !== externalFilter &&
      inputRef.current !== document.activeElement
    ) {
      localFilterRef.current = externalFilter
      if (inputRef.current) {
        inputRef.current.value = externalFilter
      }
    }
  }, [externalFilter])

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      localFilterRef.current = value

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      const debounceMs =
        filterRef.current?.debounceMs ?? DEFAULT_FILTER_DEBOUNCE_MS
      debounceRef.current = setTimeout(() => {
        filterRef.current?.onGlobalFilterChange?.(localFilterRef.current)
      }, debounceMs)
    },
    [],
  )

  const handleClearFilter = useCallback(() => {
    localFilterRef.current = ''
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    filterRef.current?.onGlobalFilterChange?.('')
    inputRef.current?.focus()
  }, [])

  const handleSubmitFilter = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    filterRef.current?.onGlobalFilterChange?.(localFilterRef.current)
  }, [])

  // Export handler - stable callback using refs
  const handleExport = useCallback((format: ExportFormat) => {
    onExportRef.current?.(format)
    exportConfigRef.current?.onExport?.(format, [])
  }, [])

  // Column visibility change - stable callback using refs
  const handleColumnVisibilityChange = useCallback(
    (columnId: string, visible: boolean) => {
      const cv = columnVisibilityRef.current
      if (!cv) return
      const newVisibility = {
        ...cv.columnVisibility,
        [columnId]: visible,
      }
      cv.onColumnVisibilityChange(newVisibility)
    },
    [],
  )

  // Density change handler
  const handleDensityChange = useCallback(
    (newDensity: DensityType) => {
      onDensityChange?.(newDensity)
    },
    [onDensityChange],
  )

  // Filter hideable columns and map to ColumnInfo - memoized
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

  // Memoize computed booleans
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

  // Memoize export formats
  const exportFormats = useMemo(
    () => exportConfig?.formats ?? (['csv', 'json', 'xlsx'] as ExportFormat[]),
    [exportConfig?.formats],
  )

  // Memoize search input props
  const searchPlaceholder = filter?.placeholder ?? t('search')
  const showClearButton = filter?.showClearButton ?? true

  // Memoize translation labels for sub-components
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
    () => ({
      export: t('export'),
      exportFormat: t('exportFormat'),
    }),
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Memoize container class
  const containerClass = useMemo(
    () => cn('flex flex-col gap-4 py-4', className),
    [className],
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className={containerClass}>
        {/* Main toolbar row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: Search and custom start */}
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

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            {headerActions}

            {/* Fullscreen toggle */}
            {showFlags.fullscreen && onToggleFullscreen && (
              <TooltipButton
                onClick={onToggleFullscreen}
                icon={isFullscreen ? Minimize : Maximize}
                tooltip={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
              />
            )}

            {/* Copy button */}
            {showFlags.copy && onCopy && (
              <TooltipButton onClick={onCopy} icon={Copy} tooltip={t('copy')} />
            )}

            {/* Print button */}
            {showFlags.print && onPrint && (
              <TooltipButton
                onClick={onPrint}
                icon={Printer}
                tooltip={t('print')}
              />
            )}

            {/* Refresh button */}
            {showFlags.refresh && onRefresh && (
              <TooltipButton
                onClick={onRefresh}
                disabled={isRefreshing}
                icon={RefreshCw}
                tooltip={t('refresh')}
                iconClassName={isRefreshing ? 'animate-spin' : undefined}
              />
            )}

            {/* Density toggle */}
            {showFlags.densityToggle && onDensityChange && (
              <DensityDropdown
                currentDensity={density}
                onDensityChange={handleDensityChange}
                labels={densityLabels}
              />
            )}

            {/* Column visibility */}
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

            {/* Export */}
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

        {/* Bulk actions row */}
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
