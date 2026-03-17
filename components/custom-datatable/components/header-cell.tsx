'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { memo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

// Memoized selection header cell
export const SelectionHeaderCell = memo(function SelectionHeaderCell({
  mode,
  isAllSelected,
  isSomeSelected,
  onToggle,
}: {
  mode: 'single' | 'multiple'
  isAllSelected: boolean
  isSomeSelected: boolean
  onToggle: () => void
}) {
  return (
    <TableHead
      className="bg-background sticky left-0 z-10 w-10 !px-2 !py-0"
      style={{ width: 40, minWidth: 40, maxWidth: 40 }}
    >
      {mode === 'multiple' && (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={onToggle}
            aria-label="Seleccionar todo"
          />
        </div>
      )}
    </TableHead>
  )
})

// Memoized expander header cell
export const ExpanderHeaderCell = memo(function ExpanderHeaderCell({
  hasCheckbox,
}: {
  hasCheckbox: boolean
}) {
  return (
    <TableHead
      className={cn(
        'bg-background sticky z-10 w-9 !px-1 !py-0',
        hasCheckbox ? 'left-10' : 'left-0',
      )}
      style={{ width: 36, minWidth: 36, maxWidth: 36 }}
    />
  )
})

// Sort icon component
export const SortIcon = memo(function SortIcon({
  direction,
}: {
  direction: 'asc' | 'desc' | false
}) {
  if (direction === 'asc')
    return <ArrowUp className="h-4 w-4" aria-hidden="true" />
  if (direction === 'desc')
    return <ArrowDown className="h-4 w-4" aria-hidden="true" />
  return <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
})
