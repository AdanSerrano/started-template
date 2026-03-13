'use client'

import { memo, useCallback, useRef, Fragment, useMemo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableRow } from '@/components/ui/table'

import type {
  CustomColumnDef,
  SelectionConfig,
  ExpansionConfig,
  StyleConfig,
} from '../types'
import { DENSITY_PADDING, DENSITY_HEIGHT, CLICK_DELAY_MS } from '../constants'

interface TableRowProps<TData> {
  row: TData
  rowId: string
  rowIndex: number
  columns: CustomColumnDef<TData>[]
  selection?: SelectionConfig<TData> | undefined
  expansion?: ExpansionConfig<TData> | undefined
  style?: StyleConfig | undefined
  // State objects for direct lookup - avoids callback recreation
  selectionState: Record<string, boolean>
  expansionState: Record<string, boolean>
  onToggleSelection: (rowId: string) => void
  onToggleExpansion: (rowId: string) => void
  onRowClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowDoubleClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowContextMenu?: ((row: TData, event: React.MouseEvent) => void) | undefined
  rowClassName?: string | undefined
}

// Memoized checkbox cell - no generics, safe to memo
const SelectionCell = memo(function SelectionCell({
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
interface DataCellProps<TData> {
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

const DataCell = memo(DataCellInner) as typeof DataCellInner

// Memoized expander cell - no generics, safe to memo
const ExpanderCell = memo(function ExpanderCell({
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
  // Derive selection/expansion from state objects - this is the key optimization
  // Each row only re-renders when ITS OWN state changes
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

  // Stable toggle handlers
  const handleToggleSelection = useCallback(() => {
    onToggleSelection(rowId)
  }, [onToggleSelection, rowId])

  const handleToggleExpansion = useCallback(() => {
    onToggleExpansion(rowId)
  }, [onToggleExpansion, rowId])

  // Refs for stable click handler
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
    const isInteractiveElement =
      target.closest('button') ||
      target.closest("[role='checkbox']") ||
      target.closest("[role='menuitem']") ||
      target.closest('[data-radix-collection-item]') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('[data-stop-propagation]')

    if (isInteractiveElement) return

    clickCountRef.current += 1

    if (clickCountRef.current === 1) {
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          const props = propsRef.current

          if (props.expansion?.expandOnClick && props.canExpand) {
            props.onToggleExpansion(props.rowId)
          }

          if (props.selection?.selectOnRowClick && props.selection.enabled) {
            props.onToggleSelection(props.rowId)
            props.selection.onRowSelect?.(props.row)
          }

          props.onRowClick?.(props.row, e)
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
      const props = propsRef.current
      if (props.expansion?.expandOnClick && props.canExpand) {
        props.onToggleExpansion(props.rowId)
      }
      if (props.selection?.selectOnRowClick && props.selection.enabled) {
        props.onToggleSelection(props.rowId)
      }
    }
  }, [])

  const hasRowInteraction = !!(
    onRowClick ||
    onRowDoubleClick ||
    expansion?.expandOnClick ||
    selection?.selectOnRowClick
  )

  // Memoize row class with smooth transitions
  const rowClass = useMemo(
    () =>
      cn(
        DENSITY_HEIGHT[density],
        // Smooth transitions for all state changes
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

  // Calculate colspan for expanded content
  const expandedColSpan = useMemo(
    () =>
      columns.length +
      (selection?.enabled && selection.showCheckbox ? 1 : 0) +
      (expansion?.enabled ? 1 : 0),
    [
      columns.length,
      selection?.enabled,
      selection?.showCheckbox,
      expansion?.enabled,
    ],
  )

  // Ref for row data to avoid re-rendering expanded content unnecessarily
  const rowRef = useRef(row)
  rowRef.current = row

  // Memoize expanded content - only re-render when isExpanded changes
  // Uses rowRef to access current row data without triggering re-renders
  const expandedContent = useMemo(() => {
    if (!isExpanded || !expansion?.renderContent) return null
    return expansion.renderContent(rowRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, expansion?.renderContent])

  // Pre-compute cell STYLES only - these don't depend on row state
  // This is stable across selection/expansion changes
  const cellStyles = useMemo(() => {
    return columns.map((column) => {
      const cellStyle: React.CSSProperties = {}
      if (column.width) {
        cellStyle.width =
          typeof column.width === 'number' ? `${column.width}px` : column.width
      }
      if (column.minWidth) cellStyle.minWidth = `${column.minWidth}px`
      if (column.maxWidth) cellStyle.maxWidth = `${column.maxWidth}px`

      const alignClass =
        column.align === 'center'
          ? 'text-center'
          : column.align === 'right'
            ? 'text-right'
            : 'text-left'

      const pinnedClass = column.pinned
        ? cn(
            'sticky z-10 bg-background will-change-transform',
            column.pinned === 'left'
              ? 'left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
              : 'right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]',
          )
        : ''

      return {
        columnId: column.id,
        alignClass,
        pinnedClass,
        cellClassName: column.cellClassName,
        cellStyle,
        // Store the cell function for lazy evaluation
        cellFn: column.cell,
      }
    })
  }, [columns]) // Only recalculate when columns change

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
        {/* Selection cell */}
        {hasCheckbox && selection && (
          <SelectionCell
            isSelected={isSelected}
            mode={selection.mode ?? 'multiple'}
            onToggle={handleToggleSelection}
            rowIndex={rowIndex}
          />
        )}

        {/* Expander cell */}
        {expansion?.enabled && (
          <ExpanderCell
            isExpanded={isExpanded}
            canExpand={canExpand}
            onToggle={handleToggleExpansion}
            hasCheckbox={!!hasCheckbox}
            rowIndex={rowIndex}
          />
        )}

        {/* Data cells - cellFn executes inside DataCell memo boundary */}
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

      {/* Expanded content */}
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

// Custom comparison for memo - KEY OPTIMIZATION
// Only re-render when THIS ROW's state changes, not when any selection changes
function arePropsEqual<TData>(
  prevProps: TableRowProps<TData>,
  nextProps: TableRowProps<TData>,
): boolean {
  // Fast path: check if THIS ROW's selection/expansion state changed
  // This is the key optimization - we don't re-render if other rows change
  const prevSelected = !!prevProps.selectionState[prevProps.rowId]
  const nextSelected = !!nextProps.selectionState[nextProps.rowId]
  if (prevSelected !== nextSelected) return false

  const prevExpanded = !!prevProps.expansionState[prevProps.rowId]
  const nextExpanded = !!nextProps.expansionState[nextProps.rowId]
  if (prevExpanded !== nextExpanded) return false

  // Check identity props
  if (prevProps.rowId !== nextProps.rowId) return false
  if (prevProps.rowIndex !== nextProps.rowIndex) return false
  if (prevProps.row !== nextProps.row) return false
  if (prevProps.rowClassName !== nextProps.rowClassName) return false

  // Check style props
  if (prevProps.style?.density !== nextProps.style?.density) return false
  if (prevProps.style?.striped !== nextProps.style?.striped) return false
  if (prevProps.style?.hover !== nextProps.style?.hover) return false

  // Check selection config
  if (prevProps.selection?.enabled !== nextProps.selection?.enabled)
    return false
  if (prevProps.selection?.mode !== nextProps.selection?.mode) return false
  if (
    prevProps.selection?.selectOnRowClick !==
    nextProps.selection?.selectOnRowClick
  )
    return false
  if (prevProps.selection?.showCheckbox !== nextProps.selection?.showCheckbox)
    return false

  // Check expansion config
  if (prevProps.expansion?.enabled !== nextProps.expansion?.enabled)
    return false
  if (prevProps.expansion?.expandOnClick !== nextProps.expansion?.expandOnClick)
    return false

  // Check callbacks (should be stable with useCallback)
  if (prevProps.onToggleSelection !== nextProps.onToggleSelection) return false
  if (prevProps.onToggleExpansion !== nextProps.onToggleExpansion) return false
  if (prevProps.onRowClick !== nextProps.onRowClick) return false
  if (prevProps.onRowDoubleClick !== nextProps.onRowDoubleClick) return false

  // Check columns reference (should be stable)
  if (prevProps.columns !== nextProps.columns) return false

  return true
}

export const CustomTableRow = memo(
  TableRowInner,
  arePropsEqual,
) as typeof TableRowInner
