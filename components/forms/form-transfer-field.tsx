'use client'

import { memo, useCallback, useMemo, useState, useDeferredValue } from 'react'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Search,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, FormFieldOption } from './form-field.types'

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

const DEFAULT_LABELS = {
  available: 'Available',
  selected: 'Selected',
  searchAvailable: 'Search available...',
  searchSelected: 'Search selected...',
  moveRight: 'Move right',
  moveLeft: 'Move left',
  moveAllRight: 'Move all right',
  moveAllLeft: 'Move all left',
}

interface SimpleCheckboxProps {
  checked: boolean
  indeterminate?: boolean | undefined
}

const SimpleCheckbox = memo(function SimpleCheckbox({
  checked,
  indeterminate,
}: SimpleCheckboxProps) {
  return (
    <div
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs',
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-input',
        indeterminate && !checked && 'bg-primary/50 border-primary',
      )}
    >
      {checked && <Check className="size-3" />}
      {indeterminate && !checked && (
        <div className="bg-primary-foreground size-2 rounded-xs" />
      )}
    </div>
  )
})

interface TransferItemProps {
  item: FormFieldOption<string>
  isChecked: boolean
  disabled?: boolean | undefined
  onToggle: (value: string) => void
}

const TransferItem = memo(function TransferItem({
  item,
  isChecked,
  disabled,
  onToggle,
}: TransferItemProps) {
  const handleClick = useCallback(() => {
    if (!item.disabled && !disabled) {
      onToggle(item.value)
    }
  }, [item.disabled, item.value, disabled, onToggle])

  return (
    <div
      className={cn(
        'hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5',
        isChecked && 'bg-accent/30',
        (item.disabled || disabled) && 'cursor-not-allowed opacity-50',
      )}
      onClick={handleClick}
    >
      <SimpleCheckbox checked={isChecked} />
      <span className="truncate text-sm">{item.label}</span>
    </div>
  )
})

interface SelectAllRowProps {
  allChecked: boolean
  someChecked: boolean
  disabled?: boolean | undefined
  onSelectAll: () => void
}

const SelectAllRow = memo(function SelectAllRow({
  allChecked,
  someChecked,
  disabled,
  onSelectAll,
}: SelectAllRowProps) {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelectAll()
    }
  }, [disabled, onSelectAll])

  return (
    <div
      className={cn(
        'hover:bg-accent/50 flex cursor-pointer items-center gap-2 border-b px-3 py-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      onClick={handleClick}
    >
      <SimpleCheckbox
        checked={allChecked}
        indeterminate={someChecked && !allChecked}
      />
      <span className="text-sm">Select all</span>
    </div>
  )
})

interface TransferListProps {
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

const TransferList = memo(function TransferList({
  title,
  items,
  checkedSet,
  totalCount,
  checkedCount,
  searchValue,
  searchPlaceholder,
  showSearch,
  showSelectAll,
  height,
  disabled,
  onToggleItem,
  onSelectAll,
  onSearchChange,
}: TransferListProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value)
    },
    [onSearchChange],
  )

  const enabledItems = useMemo(() => items.filter((i) => !i.disabled), [items])

  const allChecked = useMemo(
    () =>
      enabledItems.length > 0 &&
      enabledItems.every((i) => checkedSet.has(i.value)),
    [enabledItems, checkedSet],
  )

  const someChecked = useMemo(
    () => items.some((i) => checkedSet.has(i.value)),
    [items, checkedSet],
  )

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-lg border">
      <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-muted-foreground text-xs">
          {checkedCount}/{totalCount}
        </span>
      </div>

      {showSearch && (
        <div className="border-b p-2">
          <div className="relative">
            <Search className="text-foreground/60 pointer-events-none absolute top-1/2 left-2 z-10 h-4 w-4 -translate-y-1/2" />
            <Input
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              disabled={disabled ?? false}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
      )}

      {showSelectAll && items.length > 0 && (
        <SelectAllRow
          allChecked={allChecked}
          someChecked={someChecked}
          disabled={disabled ?? false}
          onSelectAll={onSelectAll}
        />
      )}

      <div className="overflow-y-auto p-1" style={{ height }}>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No items
          </p>
        ) : (
          items.map((item) => (
            <TransferItem
              key={item.value}
              item={item}
              isChecked={checkedSet.has(item.value)}
              disabled={disabled ?? false}
              onToggle={onToggleItem}
            />
          ))
        )}
      </div>
    </div>
  )
})

interface TransferContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  options: FormFieldOption<string>[]
  showSearch: boolean
  showSelectAll: boolean
  height: number
  labels: typeof DEFAULT_LABELS
}

const TransferContent = memo(function TransferContent({
  field,
  hasError,
  disabled,
  options,
  showSearch,
  showSelectAll,
  height,
  labels,
}: TransferContentProps) {
  const [leftCheckedSet, setLeftCheckedSet] = useState<Set<string>>(
    () => new Set(),
  )
  const [rightCheckedSet, setRightCheckedSet] = useState<Set<string>>(
    () => new Set(),
  )
  const [leftSearch, setLeftSearch] = useState('')
  const [rightSearch, setRightSearch] = useState('')

  const deferredLeftSearch = useDeferredValue(leftSearch)
  const deferredRightSearch = useDeferredValue(rightSearch)

  const fieldValue: string[] = useMemo(
    () => (Array.isArray(field.value) ? field.value : []),
    [field.value],
  )

  const fieldValueSet = useMemo(() => new Set(fieldValue), [fieldValue])

  const availableItems = useMemo(
    () => options.filter((opt) => !fieldValueSet.has(opt.value)),
    [options, fieldValueSet],
  )

  const selectedItems = useMemo(
    () => options.filter((opt) => fieldValueSet.has(opt.value)),
    [options, fieldValueSet],
  )

  const filteredAvailable = useMemo(
    () =>
      deferredLeftSearch
        ? availableItems.filter((item) =>
            item.label.toLowerCase().includes(deferredLeftSearch.toLowerCase()),
          )
        : availableItems,
    [availableItems, deferredLeftSearch],
  )

  const filteredSelected = useMemo(
    () =>
      deferredRightSearch
        ? selectedItems.filter((item) =>
            item.label
              .toLowerCase()
              .includes(deferredRightSearch.toLowerCase()),
          )
        : selectedItems,
    [selectedItems, deferredRightSearch],
  )

  const handleLeftToggle = useCallback((value: string) => {
    setLeftCheckedSet((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const handleRightToggle = useCallback((value: string) => {
    setRightCheckedSet((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const handleSelectAllLeft = useCallback(() => {
    const enabledItems = filteredAvailable
      .filter((i) => !i.disabled)
      .map((i) => i.value)
    setLeftCheckedSet((prev) => {
      const next = new Set(prev)
      const allChecked = enabledItems.every((v) => next.has(v))
      if (allChecked) {
        enabledItems.forEach((v) => next.delete(v))
      } else {
        enabledItems.forEach((v) => next.add(v))
      }
      return next
    })
  }, [filteredAvailable])

  const handleSelectAllRight = useCallback(() => {
    const enabledItems = filteredSelected
      .filter((i) => !i.disabled)
      .map((i) => i.value)
    setRightCheckedSet((prev) => {
      const next = new Set(prev)
      const allChecked = enabledItems.every((v) => next.has(v))
      if (allChecked) {
        enabledItems.forEach((v) => next.delete(v))
      } else {
        enabledItems.forEach((v) => next.add(v))
      }
      return next
    })
  }, [filteredSelected])

  const handleMoveRight = useCallback(() => {
    setLeftCheckedSet((prev) => {
      const toMove = Array.from(prev)
      if (toMove.length === 0) return prev
      const newValue = [...fieldValue, ...toMove]
      field.onChange(newValue)
      return new Set()
    })
  }, [field, fieldValue])

  const handleMoveLeft = useCallback(() => {
    setRightCheckedSet((prev) => {
      if (prev.size === 0) return prev
      const newValue = fieldValue.filter((v) => !prev.has(v))
      field.onChange(newValue)
      return new Set()
    })
  }, [field, fieldValue])

  const handleMoveAllRight = useCallback(() => {
    const toMove = filteredAvailable
      .filter((i) => !i.disabled)
      .map((i) => i.value)
    if (toMove.length === 0) return

    const newValue = [...fieldValue, ...toMove]
    field.onChange(newValue)
    setLeftCheckedSet(new Set())
  }, [field, fieldValue, filteredAvailable])

  const handleMoveAllLeft = useCallback(() => {
    const toRemove = new Set(
      filteredSelected.filter((i) => !i.disabled).map((i) => i.value),
    )
    if (toRemove.size === 0) return

    const newValue = fieldValue.filter((v) => !toRemove.has(v))
    field.onChange(newValue)
    setRightCheckedSet(new Set())
  }, [field, fieldValue, filteredSelected])

  const handleLeftSearchChange = useCallback((value: string) => {
    setLeftSearch(value)
  }, [])

  const handleRightSearchChange = useCallback((value: string) => {
    setRightSearch(value)
  }, [])

  const leftCheckedCount = leftCheckedSet.size
  const rightCheckedCount = rightCheckedSet.size
  const canMoveRight = leftCheckedCount > 0
  const canMoveLeft = rightCheckedCount > 0
  const canMoveAllRight = filteredAvailable.some((i) => !i.disabled)
  const canMoveAllLeft = filteredSelected.some((i) => !i.disabled)

  return (
    <div
      className={cn(
        'flex items-stretch gap-2',
        hasError && '[&>div]:border-destructive',
      )}
    >
      <TransferList
        title={labels.available}
        items={filteredAvailable}
        checkedSet={leftCheckedSet}
        totalCount={availableItems.length}
        checkedCount={leftCheckedCount}
        searchValue={leftSearch}
        searchPlaceholder={labels.searchAvailable}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        height={height}
        disabled={disabled ?? false}
        onToggleItem={handleLeftToggle}
        onSelectAll={handleSelectAllLeft}
        onSearchChange={handleLeftSearchChange}
      />

      <div className="flex flex-col justify-center gap-2 px-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleMoveAllRight}
          disabled={disabled || !canMoveAllRight}
          className="h-8 w-8"
          title={labels.moveAllRight}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleMoveRight}
          disabled={disabled || !canMoveRight}
          className="h-8 w-8"
          title={labels.moveRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleMoveLeft}
          disabled={disabled || !canMoveLeft}
          className="h-8 w-8"
          title={labels.moveLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleMoveAllLeft}
          disabled={disabled || !canMoveAllLeft}
          className="h-8 w-8"
          title={labels.moveAllLeft}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      <TransferList
        title={labels.selected}
        items={filteredSelected}
        checkedSet={rightCheckedSet}
        totalCount={selectedItems.length}
        checkedCount={rightCheckedCount}
        searchValue={rightSearch}
        searchPlaceholder={labels.searchSelected}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        height={height}
        disabled={disabled ?? false}
        onToggleItem={handleRightToggle}
        onSelectAll={handleSelectAllRight}
        onSearchChange={handleRightSearchChange}
      />
    </div>
  )
})

function FormTransferFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  required,
  options,
  showSearch = true,
  showSelectAll = true,
  height = 250,
  labels: customLabels,
}: FormTransferFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
    [customLabels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <TransferContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              options={options}
              showSearch={showSearch}
              showSelectAll={showSelectAll}
              height={height}
              labels={labels}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormTransferField = memo(
  FormTransferFieldComponent,
) as typeof FormTransferFieldComponent
