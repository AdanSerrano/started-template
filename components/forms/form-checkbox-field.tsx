'use client'
import { memo, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import {
  CheckboxGroupContent,
  CheckboxWithSelectAllContent,
} from './checkbox-group-content'
import { FormFieldTooltip } from './form-field-tooltip'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

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
