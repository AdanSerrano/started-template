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
import { NumberContent } from './number-content'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  showControls?: boolean | undefined
  controlsPosition?: 'sides' | 'right' | undefined
  allowDecimal?: boolean | undefined
  decimalPlaces?: number | undefined
  prefix?: string | undefined
  suffix?: string | undefined
  inputClassName?: string | undefined
}

function FormNumberFieldComponent<
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
  min,
  max,
  step = 1,
  showControls = false,
  controlsPosition = 'right',
  allowDecimal = false,
  decimalPlaces = 2,
  prefix,
  suffix,
  inputClassName,
}: FormNumberFieldProps<TFieldValues, TName>) {
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
            <NumberContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              min={min}
              max={max}
              step={step}
              showControls={showControls}
              controlsPosition={controlsPosition}
              allowDecimal={allowDecimal}
              decimalPlaces={decimalPlaces}
              prefix={prefix}
              suffix={suffix}
              inputClassName={inputClassName}
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

export const FormNumberField = memo(
  FormNumberFieldComponent,
) as typeof FormNumberFieldComponent
