'use client'

import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { TableHeader, TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  SelectionHeaderCell,
  ExpanderHeaderCell,
  SortIcon,
} from './header-cell'
import type { CustomColumnDef, SelectionConfig, SortingState } from '../types'

interface TableHeaderProps<TData> {
  columns: CustomColumnDef<TData>[]
  selection?: SelectionConfig<TData> | undefined
  showExpander?: boolean | undefined
  sorting?: SortingState[] | undefined
  onSort?: ((columnId: string) => void) | undefined
  getSortDirection?: ((columnId: string) => 'asc' | 'desc' | false) | undefined
  isAllSelected?: boolean | undefined
  isSomeSelected?: boolean | undefined
  onSelectAll?: (() => void) | undefined
  onClearSelection?: (() => void) | undefined
  stickyHeader?: boolean | undefined
  className?: string | undefined
}

function TableHeaderInner<TData>({
  columns,
  selection,
  showExpander,
  onSort,
  getSortDirection,
  isAllSelected = false,
  isSomeSelected = false,
  onSelectAll,
  onClearSelection,
  stickyHeader,
  className,
}: TableHeaderProps<TData>) {
  const propsRef = useRef({ isAllSelected, onSelectAll, onClearSelection })
  useEffect(() => {
    propsRef.current = { isAllSelected, onSelectAll, onClearSelection }
  }, [isAllSelected, onSelectAll, onClearSelection])

  const handleSelectAll = useCallback(() => {
    const p = propsRef.current
    if (p.isAllSelected) p.onClearSelection?.()
    else p.onSelectAll?.()
  }, [])

  const hasCheckbox = selection?.enabled && selection.showCheckbox
  const headerClass = useMemo(
    () =>
      cn(
        stickyHeader && 'sticky top-0 z-20 bg-background shadow-xs',
        className,
      ),
    [stickyHeader, className],
  )

  return (
    <TableHeader className={headerClass}>
      <TableRow className="hover:bg-transparent">
        {hasCheckbox && selection && (
          <SelectionHeaderCell
            mode={selection.mode ?? 'multiple'}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onToggle={handleSelectAll}
          />
        )}
        {showExpander && <ExpanderHeaderCell hasCheckbox={!!hasCheckbox} />}
        {columns.map((column) => {
          const sortDirection = getSortDirection?.(column.id) ?? false
          const canSort = column.enableSorting !== false
          const colStyle: React.CSSProperties = {}
          if (column.width) {
            colStyle.width =
              typeof column.width === 'number'
                ? `${column.width}px`
                : column.width
          }
          if (column.minWidth) colStyle.minWidth = `${column.minWidth}px`
          if (column.maxWidth) colStyle.maxWidth = `${column.maxWidth}px`

          const alignClass =
            column.align === 'center'
              ? 'text-center'
              : column.align === 'right'
                ? 'text-right'
                : 'text-left'
          const pinnedClass = column.pinned
            ? cn(
                'sticky z-10 bg-background',
                column.pinned === 'left'
                  ? 'left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                  : 'right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
              )
            : ''
          const headerContent =
            typeof column.header === 'function'
              ? column.header({ sortDirection })
              : column.header
          const buttonClass = cn(
            '-ml-3 h-8 gap-1',
            column.align === 'center' && 'mx-auto',
            column.align === 'right' && '-mr-3 ml-auto',
          )
          const ariaSortValue =
            sortDirection === 'asc'
              ? 'ascending'
              : sortDirection === 'desc'
                ? 'descending'
                : undefined

          return (
            <TableHead
              key={column.id}
              className={cn(alignClass, pinnedClass, column.headerClassName)}
              style={colStyle}
              aria-sort={canSort ? ariaSortValue : undefined}
              scope="col"
            >
              {canSort ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className={buttonClass}
                  onClick={() => onSort?.(column.id)}
                  aria-label={`Ordenar por ${typeof headerContent === 'string' ? headerContent : column.id}${sortDirection ? (sortDirection === 'asc' ? ', actualmente ascendente' : ', actualmente descendente') : ''}`}
                >
                  {headerContent}
                  <span className="flex items-center">
                    <SortIcon direction={sortDirection} />
                  </span>
                </Button>
              ) : (
                <div className="flex items-center gap-1">{headerContent}</div>
              )}
            </TableHead>
          )
        })}
      </TableRow>
    </TableHeader>
  )
}

function areHeaderPropsEqual<TData>(
  prevProps: TableHeaderProps<TData>,
  nextProps: TableHeaderProps<TData>,
): boolean {
  if (prevProps.isAllSelected !== nextProps.isAllSelected) return false
  if (prevProps.isSomeSelected !== nextProps.isSomeSelected) return false
  if (prevProps.sorting !== nextProps.sorting) return false
  if (prevProps.selection?.enabled !== nextProps.selection?.enabled)
    return false
  if (prevProps.selection?.mode !== nextProps.selection?.mode) return false
  if (prevProps.selection?.showCheckbox !== nextProps.selection?.showCheckbox)
    return false
  if (prevProps.showExpander !== nextProps.showExpander) return false
  if (prevProps.stickyHeader !== nextProps.stickyHeader) return false
  if (prevProps.className !== nextProps.className) return false
  if (prevProps.columns !== nextProps.columns) return false
  if (prevProps.onSort !== nextProps.onSort) return false
  if (prevProps.getSortDirection !== nextProps.getSortDirection) return false
  if (prevProps.onSelectAll !== nextProps.onSelectAll) return false
  if (prevProps.onClearSelection !== nextProps.onClearSelection) return false
  return true
}

export const CustomTableHeader = memo(
  TableHeaderInner,
  areHeaderPropsEqual,
) as typeof TableHeaderInner
