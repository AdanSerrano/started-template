'use client'

import { memo, useMemo } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CreditCardContent } from './form-credit-card-field-content'
import {
  DEFAULT_LABELS,
  DEFAULT_PLACEHOLDERS,
} from './form-credit-card-field.utils'
import type { CreditCardValue } from './form-credit-card-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { CreditCardValue }

export interface FormCreditCardFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showCardholderName?: boolean | undefined
  showCardType?: boolean | undefined
  labels?: {
    cardNumber?: string | undefined
    expiry?: string | undefined
    cvc?: string | undefined
    name?: string | undefined
  }
  placeholders?: {
    cardNumber?: string | undefined
    expiry?: string | undefined
    cvc?: string | undefined
    name?: string | undefined
  }
}

function FormCreditCardFieldComponent<
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
  showCardholderName = true,
  showCardType = true,
  labels: customLabels,
  placeholders: customPlaceholders,
}: FormCreditCardFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
    [customLabels],
  )
  const placeholders = useMemo(
    () =>
      ({
        ...DEFAULT_PLACEHOLDERS,
        ...customPlaceholders,
      }) as typeof DEFAULT_PLACEHOLDERS,
    [customPlaceholders],
  )

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
            <CreditCardContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              showCardholderName={showCardholderName}
              showCardType={showCardType}
              labels={labels}
              placeholders={placeholders}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormCreditCardField = memo(
  FormCreditCardFieldComponent,
) as typeof FormCreditCardFieldComponent
