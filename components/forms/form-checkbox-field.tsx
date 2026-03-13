'use client'

import { memo, useCallback, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormCheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  labelPosition?: 'left' | 'right' | undefined
  checkboxClassName?: string | undefined
  indeterminate?: boolean | undefined
}

function FormCheckboxFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  tooltip,
  labelPosition = 'right',
  checkboxClassName,
  indeterminate,
}: FormCheckboxFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const checkedState = indeterminate
          ? 'indeterminate'
          : (field.value ?? false)

        return (
          <FormItem
            className={cn(
              'flex flex-row items-start space-y-0 space-x-3',
              className,
            )}
          >
            {labelPosition === 'left' && label && (
              <div className="flex-1 space-y-1 leading-none">
                <div className="flex items-center gap-1.5">
                  <FormLabel className="cursor-pointer">{label}</FormLabel>
                  {tooltip && <FormFieldTooltip tooltip={tooltip} />}
                </div>
                {description && (
                  <FormDescription className="text-xs">
                    {description}
                  </FormDescription>
                )}
              </div>
            )}
            <FormControl>
              <Checkbox
                checked={checkedState}
                onCheckedChange={field.onChange}
                disabled={disabled ?? false}
                className={checkboxClassName}
              />
            </FormControl>
            {labelPosition === 'right' && label && (
              <div className="space-y-1 leading-none">
                <div className="flex items-center gap-1.5">
                  <FormLabel className="cursor-pointer">{label}</FormLabel>
                  {tooltip && <FormFieldTooltip tooltip={tooltip} />}
                </div>
                {description && (
                  <FormDescription className="text-xs">
                    {description}
                  </FormDescription>
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export const FormCheckboxField = memo(
  FormCheckboxFieldComponent,
) as typeof FormCheckboxFieldComponent

export interface FormCheckboxWithSelectAllProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  options: SelectOption[]
  orientation?: 'horizontal' | 'vertical' | undefined
  columns?: 1 | 2 | 3 | 4 | undefined
  selectAllLabel?: string | undefined
  showSelectAll?: boolean | undefined
}

interface CheckboxOptionItemProps {
  option: SelectOption
  isChecked: boolean
  disabled?: boolean | undefined
  onToggle: (value: string, checked: boolean) => void
}

const CheckboxOptionItem = memo(function CheckboxOptionItem({
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

interface CheckboxWithSelectAllContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  orientation: 'horizontal' | 'vertical'
  gridClass: string
  selectAllLabel: string
  showSelectAll: boolean
  disabled?: boolean | undefined
}

const CheckboxWithSelectAllContent = memo(
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

function FormCheckboxWithSelectAllComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  tooltip,
  options,
  orientation = 'vertical',
  columns = 1,
  selectAllLabel = 'Select all',
  showSelectAll = true,
}: FormCheckboxWithSelectAllProps<TFieldValues, TName>) {
  const gridClass = useMemo(
    () =>
      ({
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
      })[columns],
    [columns],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>{label}</FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}

          <CheckboxWithSelectAllContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            options={options}
            orientation={orientation}
            gridClass={gridClass}
            selectAllLabel={selectAllLabel}
            showSelectAll={showSelectAll}
            disabled={disabled ?? false}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormCheckboxWithSelectAll = memo(
  FormCheckboxWithSelectAllComponent,
) as typeof FormCheckboxWithSelectAllComponent

export interface FormCheckboxGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  options: SelectOption[]
  orientation?: 'horizontal' | 'vertical' | undefined
  columns?: 1 | 2 | 3 | 4 | undefined
}

interface CheckboxGroupContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  orientation: 'horizontal' | 'vertical'
  gridClass: string
  disabled?: boolean | undefined
}

const CheckboxGroupContent = memo(function CheckboxGroupContent({
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

function FormCheckboxGroupFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  options,
  orientation = 'vertical',
  columns = 1,
}: FormCheckboxGroupFieldProps<TFieldValues, TName>) {
  const gridClass = useMemo(
    () =>
      ({
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
      })[columns],
    [columns],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <CheckboxGroupContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            options={options}
            orientation={orientation}
            gridClass={gridClass}
            disabled={disabled ?? false}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormCheckboxGroupField = memo(
  FormCheckboxGroupFieldComponent,
) as typeof FormCheckboxGroupFieldComponent
