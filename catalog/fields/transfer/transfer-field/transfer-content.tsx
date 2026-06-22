'use client'

import { memo, useCallback, useMemo, useState, useDeferredValue } from 'react'
import { cn } from '@/lib/utils'
import { TransferControls } from './transfer-item'
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
      if (allChecked) enabledItems.forEach((v) => next.delete(v))
      else enabledItems.forEach((v) => next.add(v))
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
      if (allChecked) enabledItems.forEach((v) => next.delete(v))
      else enabledItems.forEach((v) => next.add(v))
      return next
    })
  }, [filteredSelected])

  const handleMoveRight = useCallback(() => {
    setLeftCheckedSet((prev) => {
      const toMove = Array.from(prev)
      if (toMove.length === 0) return prev
      field.onChange([...fieldValue, ...toMove])
      return new Set()
    })
  }, [field, fieldValue])

  const handleMoveLeft = useCallback(() => {
    setRightCheckedSet((prev) => {
      if (prev.size === 0) return prev
      field.onChange(fieldValue.filter((v) => !prev.has(v)))
      return new Set()
    })
  }, [field, fieldValue])

  const handleMoveAllRight = useCallback(() => {
    const toMove = filteredAvailable
      .filter((i) => !i.disabled)
      .map((i) => i.value)
    if (toMove.length === 0) return
    field.onChange([...fieldValue, ...toMove])
    setLeftCheckedSet(new Set())
  }, [field, fieldValue, filteredAvailable])

  const handleMoveAllLeft = useCallback(() => {
    const toRemove = new Set(
      filteredSelected.filter((i) => !i.disabled).map((i) => i.value),
    )
    if (toRemove.size === 0) return
    field.onChange(fieldValue.filter((v) => !toRemove.has(v)))
    setRightCheckedSet(new Set())
  }, [field, fieldValue, filteredSelected])

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
        checkedCount={leftCheckedSet.size}
        searchValue={leftSearch}
        searchPlaceholder={labels.searchAvailable}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        height={height}
        disabled={disabled ?? false}
        onToggleItem={handleLeftToggle}
        onSelectAll={handleSelectAllLeft}
        onSearchChange={(v: string) => setLeftSearch(v)}
      />
      <TransferControls
        canMoveRight={leftCheckedSet.size > 0}
        canMoveLeft={rightCheckedSet.size > 0}
        canMoveAllRight={filteredAvailable.some((i) => !i.disabled)}
        canMoveAllLeft={filteredSelected.some((i) => !i.disabled)}
        disabled={disabled ?? false}
        labels={labels}
        onMoveRight={handleMoveRight}
        onMoveLeft={handleMoveLeft}
        onMoveAllRight={handleMoveAllRight}
        onMoveAllLeft={handleMoveAllLeft}
      />
      <TransferList
        title={labels.selected}
        items={filteredSelected}
        checkedSet={rightCheckedSet}
        totalCount={selectedItems.length}
        checkedCount={rightCheckedSet.size}
        searchValue={rightSearch}
        searchPlaceholder={labels.searchSelected}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        height={height}
        disabled={disabled ?? false}
        onToggleItem={handleRightToggle}
        onSelectAll={handleSelectAllRight}
        onSearchChange={(v: string) => setRightSearch(v)}
      />
    </div>
  )
})
