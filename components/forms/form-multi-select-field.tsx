'use client'

import { memo } from 'react'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { MultiSelectContent } from './multi-select-content'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormMultiSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: SelectOption[]
  emptyMessage?: string | undefined
  searchPlaceholder?: string | undefined
  maxItems?: number | undefined
  triggerClassName?: string | undefined
  contentClassName?: string | undefined
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | undefined
}

function FormMultiSelectFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  required,
  options,
  emptyMessage = 'No results found.',
  searchPlaceholder = 'Search...',
  maxItems,
  triggerClassName,
  contentClassName,
  badgeVariant = 'secondary',
}: FormMultiSelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <MultiSelectContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            options={options}
            maxItems={maxItems}
            emptyMessage={emptyMessage}
            searchPlaceholder={searchPlaceholder}
            badgeVariant={badgeVariant}
            placeholder={placeholder}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
            contentClassName={contentClassName}
          />
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormMultiSelectField = memo(
  FormMultiSelectFieldComponent,
) as typeof FormMultiSelectFieldComponent
