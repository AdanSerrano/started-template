import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import type { BaseFormFieldProps, TreeNode } from '../form-field.types'

export interface FormTreeSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: TreeNode[]
  multiple?: boolean | undefined
  searchable?: boolean | undefined
  showCheckboxes?: boolean | undefined
  expandAll?: boolean | undefined
  maxSelections?: number | undefined
  emptyMessage?: string | undefined
}

export interface TreeItemProps {
  node: TreeNode
  level: number
  isExpanded: boolean
  isSelected: boolean
  multiple: boolean
  showCheckboxes: boolean
  expandedSet: Set<string>
  selectedSet: Set<string>
  onToggleExpand: (value: string) => void
  onSelect: (value: string) => void
  disabled?: boolean | undefined
}

export interface SelectedBadgeProps {
  value: string
  label: string
  onRemove: (value: string, e: React.MouseEvent) => void
}

export interface TreeSelectContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  options: TreeNode[]
  multiple: boolean
  showCheckboxes: boolean
  expandAll: boolean
  maxSelections?: number | undefined
  placeholder: string
  emptyMessage: string
}
