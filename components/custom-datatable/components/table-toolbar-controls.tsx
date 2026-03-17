'use client'

import {
  Search,
  X,
  Columns3,
  SlidersHorizontal,
  Rows3,
  Rows2,
  Square,
} from 'lucide-react'
import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ColumnVisibilityConfig, DensityType } from '../types'
export { ExportDropdown, BulkActionsBar } from './toolbar-actions'

const densityIcons: Record<DensityType, React.ElementType> = {
  compact: Rows2,
  default: Rows3,
  comfortable: Square,
}

const DENSITY_OPTIONS: DensityType[] = ['compact', 'default', 'comfortable']

// Memoized tooltip button component
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

// Memoized search input
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

// Memoized density dropdown
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

export interface ColumnInfo {
  id: string
  header: string | React.ReactNode
}

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
