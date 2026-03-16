'use client'

import { memo, useCallback, useMemo, useState, useDeferredValue } from 'react'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TransferList } from './transfer-list'
import type { TransferContentProps } from './types'

export const TransferContent = memo(function TransferContent({
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
