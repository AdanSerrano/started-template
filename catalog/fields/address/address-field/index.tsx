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
import { cn } from '@/lib/utils'
import { AddressContent } from './address-content'
import {
  DEFAULT_LABELS,
  DEFAULT_PLACEHOLDERS,
  DEFAULT_COUNTRIES,
} from './types'
import type { FormAddressFieldProps } from './types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

function FormAddressFieldComponent<
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
  showApartment = true,
  showState = true,
  countries = DEFAULT_COUNTRIES,
  states = [],
  layout = 'stacked',
  labels: customLabels,
  placeholders: customPlaceholders,
}: FormAddressFieldProps<TFieldValues, TName>) {
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
            <div
              className={cn(
                'space-y-4 rounded-lg border p-4',
                fieldState.error && 'border-destructive',
              )}
            >
              <AddressContent
                field={
                  field as unknown as ControllerRenderProps<FieldValues, string>
                }
                hasError={!!fieldState.error}
                disabled={disabled ?? false}
                showApartment={showApartment}
                showState={showState}
                countries={countries}
                states={states}
                layout={layout}
                labels={labels}
                placeholders={placeholders}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormAddressField = memo(
  FormAddressFieldComponent,
) as typeof FormAddressFieldComponent

export type { FormAddressFieldProps, AddressValue } from './types'
