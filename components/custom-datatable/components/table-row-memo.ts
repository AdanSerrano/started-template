import type {
  CustomColumnDef,
  SelectionConfig,
  ExpansionConfig,
  StyleConfig,
} from '../types'

export interface TableRowProps<TData> {
  row: TData
  rowId: string
  rowIndex: number
  columns: CustomColumnDef<TData>[]
  selection?: SelectionConfig<TData> | undefined
  expansion?: ExpansionConfig<TData> | undefined
  style?: StyleConfig | undefined
  selectionState: Record<string, boolean>
  expansionState: Record<string, boolean>
  onToggleSelection: (rowId: string) => void
  onToggleExpansion: (rowId: string) => void
  onRowClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowDoubleClick?: ((row: TData, event: React.MouseEvent) => void) | undefined
  onRowContextMenu?: ((row: TData, event: React.MouseEvent) => void) | undefined
  rowClassName?: string | undefined
}

export function areRowPropsEqual<TData>(
  prevProps: TableRowProps<TData>,
  nextProps: TableRowProps<TData>,
): boolean {
  const prevSelected = !!prevProps.selectionState[prevProps.rowId]
  const nextSelected = !!nextProps.selectionState[nextProps.rowId]
  if (prevSelected !== nextSelected) return false

  const prevExpanded = !!prevProps.expansionState[prevProps.rowId]
  const nextExpanded = !!nextProps.expansionState[nextProps.rowId]
  if (prevExpanded !== nextExpanded) return false

  if (prevProps.rowId !== nextProps.rowId) return false
  if (prevProps.rowIndex !== nextProps.rowIndex) return false
  if (prevProps.row !== nextProps.row) return false
  if (prevProps.rowClassName !== nextProps.rowClassName) return false

  if (prevProps.style?.density !== nextProps.style?.density) return false
  if (prevProps.style?.striped !== nextProps.style?.striped) return false
  if (prevProps.style?.hover !== nextProps.style?.hover) return false

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

  if (prevProps.expansion?.enabled !== nextProps.expansion?.enabled)
    return false
  if (prevProps.expansion?.expandOnClick !== nextProps.expansion?.expandOnClick)
    return false

  if (prevProps.onToggleSelection !== nextProps.onToggleSelection) return false
  if (prevProps.onToggleExpansion !== nextProps.onToggleExpansion) return false
  if (prevProps.onRowClick !== nextProps.onRowClick) return false
  if (prevProps.onRowDoubleClick !== nextProps.onRowDoubleClick) return false
  if (prevProps.columns !== nextProps.columns) return false

  return true
}
