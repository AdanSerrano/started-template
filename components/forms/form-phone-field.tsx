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
import { FormFieldTooltip } from './form-field-tooltip'
import { DEFAULT_COUNTRIES } from './form-phone-field.data'
import { PhoneContent } from './phone-field-content'
import type { BaseFormFieldProps } from './form-field.types'
import type { CountryCode } from './form-phone-field.data'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { CountryCode } from './form-phone-field.data'
export type { PhoneValue } from './phone-field-content'

export interface FormPhoneFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  countries?: CountryCode[] | undefined
  defaultCountry?: string | undefined
  showCountrySelect?: boolean | undefined
  formatOnBlur?: boolean | undefined
  inputClassName?: string | undefined
  labels?:
    | {
        searchCountry?: string | undefined
        noCountryFound?: string | undefined
      }
    | undefined
}

function FormPhoneFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '123 456 7890',
  disabled,
  className,
  required,
  tooltip,
  countries = DEFAULT_COUNTRIES,
  defaultCountry = 'US',
  showCountrySelect = true,
  formatOnBlur = true,
  inputClassName,
  labels,
}: FormPhoneFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () =>
      ({
        searchCountry: 'Search country...',
        noCountryFound: 'No country found',
        ...labels,
      }) as { searchCountry: string; noCountryFound: string },
    [labels],
  )
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
            <PhoneContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              countries={countries}
              defaultCountry={defaultCountry}
              showCountrySelect={showCountrySelect}
              formatOnBlur={formatOnBlur}
              placeholder={placeholder}
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              inputClassName={inputClassName}
              mergedLabels={mergedLabels}
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

export const FormPhoneField = memo(
  FormPhoneFieldComponent,
) as typeof FormPhoneFieldComponent
