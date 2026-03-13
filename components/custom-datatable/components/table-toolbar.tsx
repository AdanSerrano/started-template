'use client'

import { memo, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Search,
  X,
  Download,
  Columns3,
  RefreshCw,
  FileText,
  FileJson,
  FileSpreadsheet,
  SlidersHorizontal,
  Rows3,
  Rows2,
  Square,
  Copy,
  Printer,
  Maximize,
  Minimize,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type {
  FilterConfig,
  ExportConfig,
  ColumnVisibilityConfig,
  ToolbarConfig,
  CustomColumnDef,
  DensityType,
  ExportFormat,
} from '../types'
import { DEFAULT_FILTER_DEBOUNCE_MS } from '../constants'

const exportIcons: Record<ExportFormat, React.ElementType> = {
  csv: FileText,
  json: FileJson,
  xlsx: FileSpreadsheet,
}

const densityIcons: Record<DensityType, React.ElementType> = {
  compact: Rows2,
  default: Rows3,
  comfortable: Square,
}

const DENSITY_OPTIONS: DensityType[] = ['compact', 'default', 'comfortable']

// Memoized tooltip button component - NO TooltipProvider here (moved to parent)
const TooltipButton = memo(function TooltipButton({
  onClick,
  disabled,
  icon: Icon,
  tooltip,
  iconClassName,
}: {
  onClick: () => void
  disabled?: boolean | undefined
  icon: React.ElementType
  tooltip: string
  iconClassName?: string | undefined
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className="h-9 w-9"
        >
          <Icon className={cn('h-4 w-4', iconClassName)} />
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
})

// Memoized search input - uses uncontrolled input with ref
const SearchInput = memo(function SearchInput({
  inputRef,
  defaultValue,
  placeholder,
  onChange,
  onClear,
  onSubmit,
  showClearButton,
  clearLabel,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  defaultValue: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  onSubmit: () => void
  showClearButton: boolean
  clearLabel: string
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
    },
    [onSubmit],
  )

  const handleClearClick = useCallback(() => {
    onClear()
  }, [onClear])

  return (
    <div className="group relative w-full sm:max-w-xs">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="peer pr-9 pl-9"
      />
      {showClearButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity peer-[:not(:placeholder-shown)]:opacity-100"
          onClick={handleClearClick}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">{clearLabel}</span>
        </Button>
      )}
    </div>
  )
})

// Memoized density dropdown - NO TooltipProvider here (moved to parent)
const DensityDropdown = memo(function DensityDropdown({
  currentDensity,
  onDensityChange,
  labels,
}: {
  currentDensity: DensityType
  onDensityChange: (density: DensityType) => void
  labels: {
    density: string
    densityRows: string
    compact: string
    default: string
    comfortable: string
  }
}) {
  const densityLabels: Record<DensityType, string> = {
    compact: labels.compact,
    default: labels.default,
    comfortable: labels.comfortable,
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">{labels.density}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{labels.densityRows}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{labels.density}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DENSITY_OPTIONS.map((d) => {
          const Icon = densityIcons[d]
          return (
            <DropdownMenuItem
              key={d}
              onClick={() => onDensityChange(d)}
              className={cn('gap-2', currentDensity === d && 'bg-accent')}
            >
              <Icon className="h-4 w-4" />
              {densityLabels[d]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// Column info for visibility dropdown - no generics needed
interface ColumnInfo {
  id: string
  header: string | React.ReactNode
}

// Memoized column visibility dropdown - NO TooltipProvider here (moved to parent)
const ColumnVisibilityDropdown = memo(function ColumnVisibilityDropdown({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  labels,
}: {
  columns: ColumnInfo[]
  columnVisibility: ColumnVisibilityConfig
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
  labels: {
    columns: string
    showHideColumns: string
    visibleColumns: string
  }
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Columns3 className="h-4 w-4" />
              <span className="hidden sm:inline">{labels.columns}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{labels.showHideColumns}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="max-h-[300px] w-48 overflow-auto"
      >
        <DropdownMenuLabel>{labels.visibleColumns}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const isVisible =
            columnVisibility.columnVisibility[column.id] !== false
          const isAlwaysVisible =
            !!columnVisibility.alwaysVisibleColumns?.includes(column.id)

          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={isVisible}
              disabled={isAlwaysVisible}
              onCheckedChange={(checked) =>
                onColumnVisibilityChange(column.id, checked)
              }
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// Memoized export dropdown
const ExportDropdown = memo(function ExportDropdown({
  formats,
  onExport,
  labels,
}: {
  formats: ExportFormat[]
  onExport: (format: ExportFormat) => void
  labels: {
    export: string
    exportFormat: string
  }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{labels.export}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{labels.exportFormat}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => {
          const Icon = exportIcons[format]
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => onExport(format)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="uppercase">{format}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// Memoized bulk actions bar
const BulkActionsBar = memo(function BulkActionsBar({
  selectedCount,
  bulkActions,
  onClearSelection,
  labels,
}: {
  selectedCount: number
  bulkActions: React.ReactNode
  onClearSelection: () => void
  labels: {
    selected: string
    selectedPlural: string
    clearSelection: string
  }
}) {
  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-md border px-4 py-2">
      <Badge variant="secondary" className="font-mono">
        {selectedCount}{' '}
        {selectedCount > 1 ? labels.selectedPlural : labels.selected}
      </Badge>
      <div className="bg-border h-4 w-px" />
      <div className="flex items-center gap-2">{bulkActions}</div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground"
      >
        {labels.clearSelection}
      </Button>
    </div>
  )
})

interface TableToolbarProps<TData> {
  // Filter
  filter?: FilterConfig | undefined

  // Export
  exportConfig?: ExportConfig<TData> | undefined
  onExport?: ((format: ExportFormat) => void) | undefined

  // Column visibility
  columnVisibility?: ColumnVisibilityConfig | undefined
  columns?: CustomColumnDef<TData>[] | undefined

  // Selection
  selectedCount?: number | undefined
  totalRows?: number | undefined
  bulkActions?: React.ReactNode | undefined
  onClearSelection?: (() => void) | undefined

  // Custom actions
  headerActions?: React.ReactNode | undefined

  // Toolbar config
  toolbarConfig?: ToolbarConfig | undefined

  // Density
  density?: DensityType | undefined
  onDensityChange?: ((density: DensityType) => void) | undefined

  // Refresh
  onRefresh?: (() => void) | undefined
  isRefreshing?: boolean | undefined

  // Copy
  onCopy?: (() => void) | undefined
  isCopyEnabled?: boolean | undefined

  // Print
  onPrint?: (() => void) | undefined
  isPrintEnabled?: boolean | undefined

  // Fullscreen
  isFullscreen?: boolean | undefined
  onToggleFullscreen?: (() => void) | undefined
  isFullscreenEnabled?: boolean | undefined

  // Classes
  className?: string | undefined
}

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

  // Density change handler - identity function wrapper removed
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

// Custom comparison for toolbar memo
function areToolbarPropsEqual<TData>(
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

export const CustomTableToolbar = memo(
  TableToolbarInner,
  areToolbarPropsEqual,
) as typeof TableToolbarInner
