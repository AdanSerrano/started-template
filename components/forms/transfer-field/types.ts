import type { FieldPath, FieldValues } from 'react-hook-form'
import type { BaseFormFieldProps, FormFieldOption } from '../form-field.types'

export interface FormTransferFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: FormFieldOption<string>[]
  showSearch?: boolean | undefined
  showSelectAll?: boolean | undefined
  height?: number | undefined
  labels?:
    | {
        available?: string | undefined
        selected?: string | undefined
        searchAvailable?: string | undefined
        searchSelected?: string | undefined
        moveRight?: string | undefined
        moveLeft?: string | undefined
        moveAllRight?: string | undefined
        moveAllLeft?: string | undefined
      }
    | undefined
}

export const DEFAULT_LABELS = {
  available: 'Available',
  selected: 'Selected',
  searchAvailable: 'Search available...',
  searchSelected: 'Search selected...',
  moveRight: 'Move right',
  moveLeft: 'Move left',
  moveAllRight: 'Move all right',
  moveAllLeft: 'Move all left',
}

export interface SimpleCheckboxProps {
  checked: boolean
  indeterminate?: boolean | undefined
}

export interface TransferItemProps {
  item: FormFieldOption<string>
  isChecked: boolean
  disabled?: boolean | undefined
  onToggle: (value: string) => void
}

export interface SelectAllRowProps {
  allChecked: boolean
  someChecked: boolean
  disabled?: boolean | undefined
  onSelectAll: () => void
}

export interface TransferListProps {
  title: string
  items: FormFieldOption<string>[]
  checkedSet: Set<string>
  totalCount: number
  checkedCount: number
  searchValue: string
  searchPlaceholder: string
  showSearch: boolean
  showSelectAll: boolean
  height: number
  disabled?: boolean | undefined
  onToggleItem: (value: string) => void
  onSelectAll: () => void
  onSearchChange: (value: string) => void
}

export interface TransferContentProps {
  field: import('react-hook-form').ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  options: FormFieldOption<string>[]
  showSearch: boolean
  showSelectAll: boolean
  height: number
  labels: typeof DEFAULT_LABELS
}
