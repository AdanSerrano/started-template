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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormToggleGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  options: SelectOption[]
  type?: 'single' | 'multiple' | undefined
  variant?: 'default' | 'outline' | undefined
  size?: 'default' | 'sm' | 'lg' | undefined
  fullWidth?: boolean | undefined
  allowDeselect?: boolean | undefined
}

interface ToggleGroupOptionItemProps {
  option: SelectOption
  fullWidth: boolean
}

const ToggleGroupOptionItem = memo(function ToggleGroupOptionItem({
  option,
  fullWidth,
}: ToggleGroupOptionItemProps) {
  const itemClasses = useMemo(
    () => cn(fullWidth && 'flex-1', 'gap-2'),
    [fullWidth],
  )

  return (
    <ToggleGroupItem
      value={option.value}
      disabled={option.disabled ?? false}
      className={itemClasses}
    >
      {option.icon && <option.icon className="h-4 w-4" />}
      {option.label}
    </ToggleGroupItem>
  )
})

interface ToggleGroupContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  type: 'single' | 'multiple'
  variant: 'default' | 'outline'
  size: 'default' | 'sm' | 'lg'
  fullWidth: boolean
  allowDeselect: boolean
  disabled?: boolean | undefined
}

const ToggleGroupContent = memo(function ToggleGroupContent({
  field,
  options,
  type,
  variant,
  size,
  fullWidth,
  allowDeselect,
  disabled,
}: ToggleGroupContentProps) {
  const handleSingleChange = useCallback(
    (value: string) => {
      if (allowDeselect || value) {
        field.onChange(value || null)
      }
    },
    [field, allowDeselect],
  )

  const handleMultipleChange = useCallback(
    (values: string[]) => {
      field.onChange(values)
    },
    [field],
  )

  const groupClasses = useMemo(() => cn(fullWidth && 'w-full'), [fullWidth])

  if (type === 'single') {
    return (
      <ToggleGroup
        type="single"
        value={field.value ?? ''}
        onValueChange={handleSingleChange}
        disabled={disabled ?? false}
        variant={variant}
        size={size}
        className={groupClasses}
      >
        {options.map((option) => (
          <ToggleGroupOptionItem
            key={option.value}
            option={option}
            fullWidth={fullWidth}
          />
        ))}
      </ToggleGroup>
    )
  }

  return (
    <ToggleGroup
      type="multiple"
      value={field.value ?? []}
      onValueChange={handleMultipleChange}
      disabled={disabled ?? false}
      variant={variant}
      size={size}
      className={groupClasses}
    >
      {options.map((option) => (
        <ToggleGroupOptionItem
          key={option.value}
          option={option}
          fullWidth={fullWidth}
        />
      ))}
    </ToggleGroup>
  )
})

function FormToggleGroupFieldComponent<
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
  tooltip,
  options,
  type = 'single',
  variant = 'outline',
  size = 'default',
  fullWidth = false,
  allowDeselect = true,
}: FormToggleGroupFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <FormControl>
            <ToggleGroupContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              options={options}
              type={type}
              variant={variant}
              size={size}
              fullWidth={fullWidth}
              allowDeselect={allowDeselect}
              disabled={disabled ?? false}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormToggleGroupField = memo(
  FormToggleGroupFieldComponent,
) as typeof FormToggleGroupFieldComponent
