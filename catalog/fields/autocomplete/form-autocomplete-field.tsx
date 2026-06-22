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
import {
  AutocompleteContent,
  DEFAULT_AUTOCOMPLETE_LABELS,
} from './form-autocomplete-field-content'
import { FormFieldTooltip } from './form-field-tooltip'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormAutoCompleteFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  suggestions?: SelectOption[] | undefined
  onSearch?: ((query: string) => void | Promise<void>) | undefined
  isLoading?: boolean | undefined
  minChars?: number | undefined
  debounceMs?: number | undefined
  allowFreeText?: boolean | undefined
  showIcon?: boolean | undefined
  labels?: {
    noResults?: string | undefined
    loading?: string | undefined
    minChars?: string | undefined
  }
  inputClassName?: string | undefined
  highlightMatch?: boolean | undefined
}

function FormAutoCompleteFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Type to search...',
  disabled,
  className,
  required,
  tooltip,
  suggestions = [],
  onSearch,
  isLoading = false,
  minChars = 1,
  allowFreeText = true,
  showIcon = true,
  labels,
  inputClassName,
  highlightMatch = true,
}: FormAutoCompleteFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () =>
      ({
        ...DEFAULT_AUTOCOMPLETE_LABELS,
        ...labels,
      }) as typeof DEFAULT_AUTOCOMPLETE_LABELS,
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
            <AutocompleteContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              suggestions={suggestions}
              onSearch={onSearch}
              isLoading={isLoading}
              minChars={minChars}
              allowFreeText={allowFreeText}
              showIcon={showIcon}
              labels={mergedLabels}
              inputClassName={inputClassName}
              highlightMatch={highlightMatch}
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

export const FormAutoCompleteField = memo(
  FormAutoCompleteFieldComponent,
) as typeof FormAutoCompleteFieldComponent
