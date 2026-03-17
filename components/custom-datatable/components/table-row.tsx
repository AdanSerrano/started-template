'use client'

import { memo, useCallback, useRef, Fragment, useMemo } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { DENSITY_HEIGHT, CLICK_DELAY_MS } from '../constants'
import {
  useComputedCellStyles,
  computeExpandedColSpan,
} from './table-cell-renderers'
import { SelectionCell, DataCell, ExpanderCell } from './table-row-cells'
import { areRowPropsEqual, type TableRowProps } from './table-row-memo'

function TableRowInner<TData>({
  row,
  rowId,
  rowIndex,
  columns,
  selection,
  expansion,
  style,
  selectionState,
  expansionState,
  onToggleSelection,
  onToggleExpansion,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  rowClassName,
}: TableRowProps<TData>) {
  const isSelected = !!selectionState[rowId]
  const isExpanded = !!expansionState[rowId]
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickCountRef = useRef(0)

  const density = style?.density ?? 'default'
  const enableHover = style?.hover ?? true
  const enableStriped = style?.striped ?? false
  const canExpand = expansion?.enabled
    ? expansion.canExpand
      ? expansion.canExpand(row)
      : true
    : false
  const hasCheckbox = selection?.enabled && selection.showCheckbox

  const handleToggleSelection = useCallback(() => {
    onToggleSelection(rowId)
  }, [onToggleSelection, rowId])
  const handleToggleExpansion = useCallback(() => {
    onToggleExpansion(rowId)
  }, [onToggleExpansion, rowId])

  const propsRef = useRef({
    row,
    rowId,
    canExpand,
    expansion,
    selection,
    onToggleExpansion,
    onToggleSelection,
    onRowClick,
    onRowDoubleClick,
  })
  propsRef.current = {
    row,
    rowId,
    canExpand,
    expansion,
    selection,
    onToggleExpansion,
    onToggleSelection,
    onRowClick,
    onRowDoubleClick,
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isInteractive =
      target.closest('button') ||
      target.closest("[role='checkbox']") ||
      target.closest("[role='menuitem']") ||
      target.closest('[data-radix-collection-item]') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('[data-stop-propagation]')
    if (isInteractive) return

    clickCountRef.current += 1
    if (clickCountRef.current === 1) {
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          const p = propsRef.current
          if (p.expansion?.expandOnClick && p.canExpand)
            p.onToggleExpansion(p.rowId)
          if (p.selection?.selectOnRowClick && p.selection.enabled) {
            p.onToggleSelection(p.rowId)
            p.selection.onRowSelect?.(p.row)
          }
          p.onRowClick?.(p.row, e)
        }
        clickCountRef.current = 0
      }, CLICK_DELAY_MS)
    } else if (clickCountRef.current === 2) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      clickCountRef.current = 0
      propsRef.current.onRowDoubleClick?.(propsRef.current.row, e)
    }
  }, [])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (onRowContextMenu) {
        e.preventDefault()
        onRowContextMenu(row, e)
      }
    },
    [row, onRowContextMenu],
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const p = propsRef.current
      if (p.expansion?.expandOnClick && p.canExpand)
        p.onToggleExpansion(p.rowId)
      if (p.selection?.selectOnRowClick && p.selection.enabled)
        p.onToggleSelection(p.rowId)
    }
  }, [])

  const hasRowInteraction = !!(
    onRowClick ||
    onRowDoubleClick ||
    expansion?.expandOnClick ||
    selection?.selectOnRowClick
  )

  const rowClass = useMemo(
    () =>
      cn(
        DENSITY_HEIGHT[density],
        'transition-all duration-150 ease-out',
        hasRowInteraction &&
          'cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
        enableHover && 'hover:bg-muted/50',
        enableStriped && rowIndex % 2 === 1 && 'bg-muted/30',
        isSelected && 'bg-primary/5',
        rowClassName,
      ),
    [
      density,
      hasRowInteraction,
      enableHover,
      enableStriped,
      rowIndex,
      isSelected,
      rowClassName,
    ],
  )

  const expandedColSpan = useMemo(
    () => computeExpandedColSpan(columns.length, selection, expansion),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      columns.length,
      selection?.enabled,
      selection?.showCheckbox,
      expansion?.enabled,
    ],
  )

  const rowRef = useRef(row)
  rowRef.current = row
  const expandedContent = useMemo(() => {
    if (!isExpanded || !expansion?.renderContent) return null
    return expansion.renderContent(rowRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, expansion?.renderContent])

  const cellStyles = useComputedCellStyles(columns)

  return (
    <Fragment>
      <TableRow
        data-state={isSelected && 'selected'}
        data-row-index={rowIndex}
        tabIndex={hasRowInteraction ? 0 : undefined}
        role={hasRowInteraction ? 'button' : undefined}
        aria-expanded={expansion?.enabled ? isExpanded : undefined}
        aria-selected={isSelected}
        className={rowClass}
        onClick={hasRowInteraction ? handleClick : undefined}
        onKeyDown={hasRowInteraction ? handleKeyDown : undefined}
        onContextMenu={onRowContextMenu ? handleContextMenu : undefined}
      >
        {hasCheckbox && selection && (
          <SelectionCell
            isSelected={isSelected}
            mode={selection.mode ?? 'multiple'}
            onToggle={handleToggleSelection}
            rowIndex={rowIndex}
          />
        )}
        {expansion?.enabled && (
          <ExpanderCell
            isExpanded={isExpanded}
            canExpand={canExpand}
            onToggle={handleToggleExpansion}
            hasCheckbox={!!hasCheckbox}
            rowIndex={rowIndex}
          />
        )}
        {cellStyles.map((cellData) => (
          <DataCell
            key={cellData.columnId}
            columnId={cellData.columnId}
            cellFn={cellData.cellFn}
            row={row}
            rowIndex={rowIndex}
            isSelected={isSelected}
            isExpanded={isExpanded}
            density={density}
            alignClass={cellData.alignClass}
            pinnedClass={cellData.pinnedClass}
            cellClassName={cellData.cellClassName}
            cellStyle={cellData.cellStyle}
          />
        ))}
      </TableRow>
      {isExpanded && expansion?.renderContent && (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={expandedColSpan} className="p-0">
            <div className="px-4 py-3">{expandedContent}</div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

export const CustomTableRow = memo(
  TableRowInner,
  areRowPropsEqual,
) as typeof TableRowInner
