'use client'

import { Search, Check } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type {
  SimpleCheckboxProps,
  TransferItemProps,
  SelectAllRowProps,
  TransferListProps,
} from './types'

export const SimpleCheckbox = memo(function SimpleCheckbox({
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

export const TransferItem = memo(function TransferItem({
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

export const TransferList = memo(function TransferList({
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
