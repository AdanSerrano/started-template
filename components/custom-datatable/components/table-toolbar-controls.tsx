'use client'

import { memo, useCallback } from 'react'
import {
  Search,
  X,
  Download,
  Columns3,
  SlidersHorizontal,
  Rows3,
  Rows2,
  Square,
  FileText,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react'

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
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type {
  ColumnVisibilityConfig,
  DensityType,
  ExportFormat,
} from '../types'

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
export const TooltipButton = memo(function TooltipButton({
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
export const SearchInput = memo(function SearchInput({
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
export const DensityDropdown = memo(function DensityDropdown({
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
export interface ColumnInfo {
  id: string
  header: string | React.ReactNode
}

// Memoized column visibility dropdown - NO TooltipProvider here (moved to parent)
export const ColumnVisibilityDropdown = memo(function ColumnVisibilityDropdown({
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
export const ExportDropdown = memo(function ExportDropdown({
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
export const BulkActionsBar = memo(function BulkActionsBar({
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
