'use client'

import { memo, useMemo, useCallback } from 'react'
import { TableBody } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { SkeletonRows, EmptyRow } from './table-empty-state'
import { CustomTableRow } from './table-row'
import type {
  CustomColumnDef,
  SelectionConfig,
  ExpansionConfig,
  StyleConfig,
} from '../types'

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

  const getRowClassNameValue = useCallback(
    (row: TData, index: number): string | undefined => {
      if (!rowClassName) return undefined
      if (typeof rowClassName === 'function') return rowClassName(row, index)
      return rowClassName
    },
    [rowClassName],
  )

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

  const emptyRowProps = useMemo(
    () => ({ columnsCount: totalColumns, emptyMessage, emptyIcon }),
    [totalColumns, emptyMessage, emptyIcon],
  )

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
