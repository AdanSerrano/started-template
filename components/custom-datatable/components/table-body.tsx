'use client'

import { memo, useMemo, useCallback } from 'react'

import { cn } from '@/lib/utils'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

import { CustomTableRow } from './table-row'
import type {
  CustomColumnDef,
  SelectionConfig,
  ExpansionConfig,
  StyleConfig,
} from '../types'
import { DENSITY_PADDING, DENSITY_HEIGHT, SKELETON_HEIGHT } from '../constants'

interface TableBodyProps<TData> {
  data: TData[]
  columns: CustomColumnDef<TData>[]
  getRowId: (row: TData) => string
  selection?: SelectionConfig<TData> | undefined
  expansion?: ExpansionConfig<TData> | undefined
  style?: StyleConfig | undefined
  isLoading?: boolean | undefined
  isPending?: boolean | undefined
  emptyMessage?: string | undefined
  emptyIcon?: React.ReactNode | undefined
  // State objects for direct lookup (more efficient than callbacks)
  selectionState: Record<string, boolean>
  expansionState: Record<string, boolean>
  onToggleSelection: (rowId: string) => void
  onToggleExpansion: (rowId: string) => void
  onRowClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowDoubleClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowContextMenu?: ((row: TData, event: React.MouseEvent) => void) | undefined
  rowClassName?: string | ((row: TData, index: number) => string) | undefined
  pageSize?: number | undefined
  className?: string | undefined
}

// Skeleton row component - fully memoized
const SkeletonRow = memo(function SkeletonRow({
  columnsCount,
  hasSelection,
  hasExpander,
  density,
  skeletonHeight,
}: {
  columnsCount: number
  hasSelection: boolean
  hasExpander: boolean
  density: 'compact' | 'default' | 'comfortable'
  skeletonHeight: string
}) {
  return (
    <TableRow className={DENSITY_HEIGHT[density]}>
      {hasSelection && (
        <TableCell className="!px-2 !py-0" style={{ width: 40 }}>
          <Skeleton className="mx-auto h-4 w-4" />
        </TableCell>
      )}
      {hasExpander && (
        <TableCell className="!px-1 !py-0" style={{ width: 36 }}>
          <Skeleton className="mx-auto h-4 w-4" />
        </TableCell>
      )}
      {Array.from({ length: columnsCount }).map((_, colIndex) => (
        <TableCell key={colIndex} className={DENSITY_PADDING[density]}>
          <Skeleton className={cn(skeletonHeight, 'w-full')} />
        </TableCell>
      ))}
    </TableRow>
  )
})

// Skeleton rows container - optimized to avoid array allocation
const SkeletonRows = memo(function SkeletonRows({
  pageSize,
  columnsCount,
  hasSelection,
  hasExpander,
  density = 'default',
}: {
  pageSize: number
  columnsCount: number
  hasSelection: boolean
  hasExpander: boolean
  density?: 'compact' | 'default' | 'comfortable' | undefined
}) {
  const skeletonHeight = SKELETON_HEIGHT[density]

  // Render directly without array allocation
  const rows: React.ReactNode[] = []
  const skeletonCount = Math.min(pageSize, 10)
  for (let i = 0; i < skeletonCount; i++) {
    rows.push(
      <SkeletonRow
        key={`skeleton-${i}`}
        columnsCount={columnsCount}
        hasSelection={hasSelection}
        hasExpander={hasExpander}
        density={density}
        skeletonHeight={skeletonHeight}
      />,
    )
  }

  return <>{rows}</>
})

// Empty state component
const EmptyRow = memo(function EmptyRow({
  columnsCount,
  emptyMessage,
  emptyIcon,
}: {
  columnsCount: number
  emptyMessage: string
  emptyIcon?: React.ReactNode | undefined
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columnsCount}
        className="h-32 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
          {emptyIcon && <span aria-hidden="true">{emptyIcon}</span>}
          <span>{emptyMessage}</span>
        </div>
      </TableCell>
    </TableRow>
  )
})

function TableBodyInner<TData>({
  data,
  columns,
  getRowId,
  selection,
  expansion,
  style,
  isLoading,
  isPending,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon,
  selectionState,
  expansionState,
  onToggleSelection,
  onToggleExpansion,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  rowClassName,
  pageSize = 10,
  className,
}: TableBodyProps<TData>) {
  const density = style?.density ?? 'default'
  const hasRows = data && data.length > 0
  const hasSelection = selection?.enabled && selection.showCheckbox
  const hasExpander = expansion?.enabled
  const totalColumns =
    columns.length + (hasSelection ? 1 : 0) + (hasExpander ? 1 : 0)

  // Memoize row class name getter
  const getRowClassNameValue = useCallback(
    (row: TData, index: number): string | undefined => {
      if (!rowClassName) return undefined
      if (typeof rowClassName === 'function') {
        return rowClassName(row, index)
      }
      return rowClassName
    },
    [rowClassName],
  )

  // Memoize skeleton props
  const skeletonProps = useMemo(
    () => ({
      pageSize,
      columnsCount: columns.length,
      hasSelection: !!hasSelection,
      hasExpander: !!hasExpander,
      density,
    }),
    [pageSize, columns.length, hasSelection, hasExpander, density],
  )

  // Memoize empty row props
  const emptyRowProps = useMemo(
    () => ({
      columnsCount: totalColumns,
      emptyMessage,
      emptyIcon,
    }),
    [totalColumns, emptyMessage, emptyIcon],
  )

  // Render rows - each row checks its own selection/expansion state
  // This avoids re-rendering ALL rows when one selection changes
  const renderedRows = useMemo(() => {
    if (isLoading || !hasRows) return null

    return data.map((row, rowIndex) => {
      const rowId = getRowId(row)
      const rowClass = getRowClassNameValue(row, rowIndex)

      return (
        <CustomTableRow
          key={rowId}
          row={row}
          rowId={rowId}
          rowIndex={rowIndex}
          columns={columns}
          selection={selection}
          expansion={expansion}
          style={style}
          selectionState={selectionState}
          expansionState={expansionState}
          onToggleSelection={onToggleSelection}
          onToggleExpansion={onToggleExpansion}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          onRowContextMenu={onRowContextMenu}
          rowClassName={rowClass}
        />
      )
    })
  }, [
    isLoading,
    hasRows,
    data,
    getRowId,
    getRowClassNameValue,
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
  ])

  return (
    <TableBody
      className={cn(
        'transition-opacity duration-150',
        isPending && 'pointer-events-none opacity-60',
        className,
      )}
    >
      {isLoading ? (
        <SkeletonRows {...skeletonProps} />
      ) : hasRows ? (
        renderedRows
      ) : (
        <EmptyRow {...emptyRowProps} />
      )}
    </TableBody>
  )
}

// Custom comparison for body memo
function areBodyPropsEqual<TData>(
  prevProps: TableBodyProps<TData>,
  nextProps: TableBodyProps<TData>,
): boolean {
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns &&
    prevProps.getRowId === nextProps.getRowId &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isPending === nextProps.isPending &&
    prevProps.pageSize === nextProps.pageSize &&
    prevProps.className === nextProps.className &&
    prevProps.emptyMessage === nextProps.emptyMessage &&
    prevProps.style?.density === nextProps.style?.density &&
    prevProps.style?.striped === nextProps.style?.striped &&
    prevProps.style?.hover === nextProps.style?.hover &&
    prevProps.selection?.enabled === nextProps.selection?.enabled &&
    prevProps.selection?.mode === nextProps.selection?.mode &&
    prevProps.selection?.showCheckbox === nextProps.selection?.showCheckbox &&
    prevProps.selection?.selectOnRowClick ===
      nextProps.selection?.selectOnRowClick &&
    prevProps.expansion?.enabled === nextProps.expansion?.enabled &&
    // Compare state objects by reference (they're memoized in the hook)
    prevProps.selectionState === nextProps.selectionState &&
    prevProps.expansionState === nextProps.expansionState &&
    prevProps.onToggleSelection === nextProps.onToggleSelection &&
    prevProps.onToggleExpansion === nextProps.onToggleExpansion &&
    prevProps.onRowClick === nextProps.onRowClick &&
    prevProps.onRowDoubleClick === nextProps.onRowDoubleClick
  )
}

export const CustomTableBody = memo(
  TableBodyInner,
  areBodyPropsEqual,
) as typeof TableBodyInner
