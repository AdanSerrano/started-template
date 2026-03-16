'use client'

import { memo } from 'react'
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
import { TreeSelectContent } from './tree-select-content'
import type { FormTreeSelectFieldProps } from './types'

function FormTreeSelectFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Select...',
  disabled,
  className,
  required,
  options,
  multiple = false,
  showCheckboxes = true,
  expandAll = false,
  maxSelections,
  emptyMessage = 'No options available',
}: FormTreeSelectFieldProps<TFieldValues, TName>) {
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
            <TreeSelectContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              options={options}
              multiple={multiple}
              showCheckboxes={showCheckboxes}
              expandAll={expandAll}
              maxSelections={maxSelections}
              placeholder={placeholder}
              emptyMessage={emptyMessage}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormTreeSelectField = memo(
  FormTreeSelectFieldComponent,
) as typeof FormTreeSelectFieldComponent

export type { FormTreeSelectFieldProps } from './types'
