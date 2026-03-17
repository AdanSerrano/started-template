'use client'

import { memo, useCallback, useMemo } from 'react'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { FormFieldTooltip } from '../form-field-tooltip'
import {
  DEFAULT_PRESET_LABELS,
  buildDateRangePresets,
  type DateRangePreset,
  type PresetLabels,
} from './date-presets'
import { DateRangeContent } from './date-range-content'
import type { BaseFormFieldProps } from '../form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormDateRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minDate?: Date | undefined
  maxDate?: Date | undefined
  disabledDates?: Date[] | undefined
  disabledDays?: ((date: Date) => boolean) | undefined
  locale?: string | undefined
  formatDate?: ((date: Date) => string) | undefined
  numberOfMonths?: 1 | 2 | undefined
  triggerClassName?: string | undefined
  presets?: DateRangePreset[] | undefined
  showPresets?: boolean | undefined
  presetLabels?: Partial<PresetLabels> | undefined
}

const defaultFormatDate = (date: Date, locale = 'en-US') =>
  date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

function FormDateRangeFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Pick a date range',
  disabled,
  className,
  required,
  tooltip,
  minDate,
  maxDate,
  disabledDates,
  disabledDays,
  locale = 'en-US',
  formatDate,
  numberOfMonths = 2,
  triggerClassName,
  presets,
  showPresets = false,
  presetLabels: customPresetLabels,
}: FormDateRangeFieldProps<TFieldValues, TName>) {
  const mergedPresetLabels = useMemo(
    () => ({ ...DEFAULT_PRESET_LABELS, ...customPresetLabels }) as PresetLabels,
    [customPresetLabels],
  )
  const defaultPresets = useMemo(
    () => buildDateRangePresets(mergedPresetLabels),
    [mergedPresetLabels],
  )
  const activePresets = useMemo(
    () => (showPresets ? (presets ?? defaultPresets) : []),
    [showPresets, presets, defaultPresets],
  )
  const format = useCallback(
    (date: Date) => formatDate?.(date) ?? defaultFormatDate(date, locale),
    [formatDate, locale],
  )
  const isDateDisabled = useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      if (disabledDates?.some((d) => d.toDateString() === date.toDateString()))
        return true
      if (disabledDays?.(date)) return true
      return false
    },
    [minDate, maxDate, disabledDates, disabledDays],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <DateRangeContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            placeholder={placeholder}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
            format={format}
            isDateDisabled={isDateDisabled}
            activePresets={activePresets}
            numberOfMonths={numberOfMonths}
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

export const FormDateRangeField = memo(
  FormDateRangeFieldComponent,
) as typeof FormDateRangeFieldComponent
