'use client'

import { memo, useCallback, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { SelectOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface CheckboxOptionItemProps {
  option: SelectOption
  isChecked: boolean
  disabled?: boolean | undefined
  onToggle: (value: string, checked: boolean) => void
}

export const CheckboxOptionItem = memo(function CheckboxOptionItem({
  option,
  isChecked,
  disabled,
  onToggle,
}: CheckboxOptionItemProps) {
  const handleChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      onToggle(option.value, checked === true)
    },
    [option.value, onToggle],
  )

  return (
    <div className="flex flex-row items-start space-y-0 space-x-3">
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled || option.disabled}
      />
      <div className="space-y-1 leading-none">
        <label className="cursor-pointer text-sm font-medium">
          {option.label}
        </label>
        {option.description && (
          <p className="text-muted-foreground text-xs">{option.description}</p>
        )}
      </div>
    </div>
  )
})

export interface CheckboxWithSelectAllContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  orientation: 'horizontal' | 'vertical'
  gridClass: string
  selectAllLabel: string
  showSelectAll: boolean
  disabled?: boolean | undefined
}

export const CheckboxWithSelectAllContent = memo(
  function CheckboxWithSelectAllContent({
    field,
    options,
    orientation,
    gridClass,
    selectAllLabel,
    showSelectAll,
    disabled,
  }: CheckboxWithSelectAllContentProps) {
    const selectedValues: string[] = useMemo(
      () => field.value ?? [],
      [field.value],
    )

    const enabledOptions = useMemo(
      () => options.filter((o) => !o.disabled),
      [options],
    )

    const { allSelected, someSelected } = useMemo(() => {
      const all = enabledOptions.every((o) => selectedValues.includes(o.value))
      const some =
        enabledOptions.some((o) => selectedValues.includes(o.value)) && !all
      return { allSelected: all, someSelected: some }
    }, [enabledOptions, selectedValues])

    const handleToggle = useCallback(
      (value: string, checked: boolean) => {
        if (checked) {
          field.onChange([...selectedValues, value])
        } else {
          field.onChange(selectedValues.filter((v) => v !== value))
        }
      },
      [selectedValues, field],
    )

    const handleSelectAll = useCallback(
      (checked: boolean | 'indeterminate') => {
        if (checked === true) {
          const allEnabledValues = enabledOptions.map((o) => o.value)
          field.onChange(allEnabledValues)
        } else {
          field.onChange([])
        }
      },
      [enabledOptions, field],
    )

    return (
      <>
        {showSelectAll && enabledOptions.length > 1 && (
          <div className="mb-2 flex items-center space-x-3 border-b pb-2">
            <Checkbox
              checked={someSelected ? 'indeterminate' : allSelected}
              onCheckedChange={handleSelectAll}
              disabled={disabled ?? false}
            />
            <label className="cursor-pointer text-sm font-medium">
              {selectAllLabel}
            </label>
          </div>
        )}

        <div
          className={cn(
            orientation === 'horizontal'
              ? 'flex flex-wrap gap-4'
              : `grid gap-3 ${gridClass}`,
          )}
        >
          {options.map((option) => (
            <CheckboxOptionItem
              key={option.value}
              option={option}
              isChecked={selectedValues.includes(option.value)}
              disabled={disabled ?? false}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </>
    )
  },
)

export interface CheckboxGroupContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  orientation: 'horizontal' | 'vertical'
  gridClass: string
  disabled?: boolean | undefined
}

export const CheckboxGroupContent = memo(function CheckboxGroupContent({
  field,
  options,
  orientation,
  gridClass,
  disabled,
}: CheckboxGroupContentProps) {
  const selectedValues: string[] = useMemo(
    () => field.value ?? [],
    [field.value],
  )

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) {
        field.onChange([...selectedValues, value])
      } else {
        field.onChange(selectedValues.filter((v) => v !== value))
      }
    },
    [selectedValues, field],
  )

  return (
    <div
      className={cn(
        orientation === 'horizontal'
          ? 'flex flex-wrap gap-4'
          : `grid gap-3 ${gridClass}`,
      )}
    >
      {options.map((option) => (
        <CheckboxOptionItem
          key={option.value}
          option={option}
          isChecked={selectedValues.includes(option.value)}
          disabled={disabled ?? false}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
})
