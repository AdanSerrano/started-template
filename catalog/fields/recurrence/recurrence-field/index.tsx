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
import { RecurrenceContent } from './recurrence-content'
import { DEFAULT_LABELS } from './types'
import type { FormRecurrenceFieldProps } from './types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

function FormRecurrenceFieldComponent<
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
  showPreview = true,
  maxInterval = 99,
  labels: customLabels,
}: FormRecurrenceFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () =>
      ({
        ...DEFAULT_LABELS,
        ...customLabels,
        days: { ...DEFAULT_LABELS.days, ...customLabels?.days },
      }) as typeof DEFAULT_LABELS,
    [customLabels],
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
            <RecurrenceContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              showPreview={showPreview}
              maxInterval={maxInterval}
              labels={labels}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormRecurrenceField = memo(
  FormRecurrenceFieldComponent,
) as typeof FormRecurrenceFieldComponent

export type {
  FormRecurrenceFieldProps,
  RecurrenceFrequency,
  EndType,
  RecurrenceDayOfWeek,
  MonthlyType,
  RecurrenceValue,
} from './types'
