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
import { CurrencyContent } from './currency-content'
import { AVAILABLE_CURRENCIES } from './form-currency-field.utils'
import { FormFieldTooltip } from './form-field-tooltip'
import type { BaseFormFieldProps, CurrencyConfig } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { CurrencyValue } from './currency-content'

export interface FormCurrencyFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  currencies?: CurrencyConfig[] | undefined
  defaultCurrency?: string | undefined
  showCurrencySelect?: boolean | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  inputClassName?: string | undefined
}

function FormCurrencyFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '0.00',
  disabled,
  className,
  required,
  tooltip,
  currencies = AVAILABLE_CURRENCIES,
  defaultCurrency = 'USD',
  showCurrencySelect = true,
  min,
  max,
  inputClassName,
}: FormCurrencyFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
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
            <CurrencyContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              currencies={currencies}
              defaultCurrency={defaultCurrency}
              showCurrencySelect={showCurrencySelect}
              placeholder={placeholder}
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              inputClassName={inputClassName}
              min={min}
              max={max}
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

export const FormCurrencyField = memo(
  FormCurrencyFieldComponent,
) as typeof FormCurrencyFieldComponent
