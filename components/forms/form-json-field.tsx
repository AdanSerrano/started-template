'use client'

import { memo } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { JsonContent } from './json-field-content'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormJsonFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minHeight?: number | undefined
  maxHeight?: number | undefined
  showToolbar?: boolean | undefined
  showValidation?: boolean | undefined
  allowFormat?: boolean | undefined
  allowMinify?: boolean | undefined
}

function FormJsonFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '{\n  "key": "value"\n}',
  disabled,
  className,
  required,
  minHeight = 200,
  maxHeight = 500,
  showToolbar = true,
  showValidation = true,
  allowFormat = true,
  allowMinify = true,
}: FormJsonFieldProps<TFieldValues, TName>) {
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
            <JsonContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              minHeight={minHeight}
              maxHeight={maxHeight}
              showToolbar={showToolbar}
              showValidation={showValidation}
              allowFormat={allowFormat}
              allowMinify={allowMinify}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormJsonField = memo(
  FormJsonFieldComponent,
) as typeof FormJsonFieldComponent
