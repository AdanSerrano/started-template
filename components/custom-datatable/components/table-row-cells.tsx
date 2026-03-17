'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { DENSITY_PADDING } from '../constants'

// Memoized checkbox cell - no generics, safe to memo
export const SelectionCell = memo(function SelectionCell({
  isSelected,
  mode,
  onToggle,
  rowIndex,
}: {
  isSelected: boolean
  mode: 'single' | 'multiple'
  onToggle: () => void
  rowIndex: number
}) {
  return (
    <TableCell
      className="bg-background sticky left-0 z-10 !px-2 !py-0"
      style={{ width: 40, minWidth: 40, maxWidth: 40 }}
    >
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        data-stop-propagation="true"
      >
        {mode === 'multiple' ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            aria-label={`Seleccionar fila ${rowIndex + 1}`}
          />
        ) : (
          <div
            className={cn(
              'h-4 w-4 cursor-pointer rounded-full border-2 transition-colors',
              isSelected
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/50',
            )}
            onClick={onToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggle()
              }
            }}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Seleccionar fila ${rowIndex + 1}`}
            tabIndex={0}
          >
            {isSelected && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="bg-primary-foreground h-1.5 w-1.5 rounded-full" />
              </div>
            )}
          </div>
        )}
      </div>
    </TableCell>
  )
})

// Memoized data cell - cellFn executes INSIDE memo boundary
// so React.memo can prevent re-renders when props are stable
export interface DataCellProps<TData> {
  columnId: string
  cellFn: (ctx: {
    row: TData
    rowIndex: number
    isSelected: boolean
    isExpanded: boolean
  }) => React.ReactNode
  row: TData
  rowIndex: number
  isSelected: boolean
  isExpanded: boolean
  density: 'compact' | 'default' | 'comfortable'
  alignClass: string
  pinnedClass: string
  cellClassName?: string | undefined
  cellStyle: React.CSSProperties
}

function DataCellInner<TData>({
  cellFn,
  row,
  rowIndex,
  isSelected,
  isExpanded,
  density,
  alignClass,
  pinnedClass,
  cellClassName,
  cellStyle,
}: DataCellProps<TData>) {
  return (
    <TableCell
      className={cn(
        DENSITY_PADDING[density],
        alignClass,
        pinnedClass,
        cellClassName,
      )}
      style={cellStyle}
    >
      {cellFn({ row, rowIndex, isSelected, isExpanded })}
    </TableCell>
  )
}

export const DataCell = memo(DataCellInner) as typeof DataCellInner

// Memoized expander cell - no generics, safe to memo
export const ExpanderCell = memo(function ExpanderCell({
  isExpanded,
  canExpand,
  onToggle,
  hasCheckbox,
  rowIndex,
}: {
  isExpanded: boolean
  canExpand: boolean
  onToggle: () => void
  hasCheckbox: boolean
  rowIndex: number
}) {
  return (
    <TableCell
      className={cn(
        'bg-background sticky z-10 !px-1 !py-0',
        hasCheckbox ? 'left-10' : 'left-0',
      )}
      style={{ width: 36, minWidth: 36, maxWidth: 36 }}
    >
      {canExpand && (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? `Contraer fila ${rowIndex + 1}`
                : `Expandir fila ${rowIndex + 1}`
            }
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </TableCell>
  )
})
