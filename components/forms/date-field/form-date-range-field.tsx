'use client'

import { CalendarIcon } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { FormFieldTooltip } from '../form-field-tooltip'
import {
  DEFAULT_PRESET_LABELS,
  buildDateRangePresets,
  type DateRangePreset,
  type PresetLabels,
} from './date-presets'
import type { BaseFormFieldProps, DateRange } from '../form-field.types'
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

interface DateRangePresetButtonProps {
  preset: DateRangePreset
  onSelect: (preset: DateRangePreset) => void
}

const DateRangePresetButton = memo(function DateRangePresetButton({
  preset,
  onSelect,
}: DateRangePresetButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(preset)
  }, [preset, onSelect])

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="justify-start text-left"
      onClick={handleClick}
    >
      {preset.label}
    </Button>
  )
})

interface DateRangeContentProps {
  field: ControllerRenderProps<FieldValues, string>
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
  format: (date: Date) => string
  isDateDisabled: (date: Date) => boolean
  activePresets: DateRangePreset[]
  numberOfMonths: 1 | 2
}

const DateRangeContent = memo(function DateRangeContent({
  field,
  placeholder,
  disabled,
  hasError,
  triggerClassName,
  format,
  isDateDisabled,
  activePresets,
  numberOfMonths,
}: DateRangeContentProps) {
  const range = field.value as DateRange | undefined

  const handlePresetSelect = useCallback(
    (preset: DateRangePreset) => {
      const rangeValue = preset.getValue()
      field.onChange(rangeValue)
    },
    [field],
  )

  const displayValue = useMemo(
    () =>
      range?.from
        ? range.to
          ? `${format(range.from)} - ${format(range.to)}`
          : format(range.from)
        : placeholder,
    [range, format, placeholder],
  )

  const buttonClasses = useMemo(
    () =>
      cn(
        'w-full justify-start text-left font-normal bg-background',
        !range?.from && 'text-muted-foreground',
        hasError && 'border-destructive',
        triggerClassName,
      ),
    [range?.from, hasError, triggerClassName],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            disabled={disabled ?? false}
            className={buttonClasses}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {activePresets.length > 0 && (
            <div className="flex flex-col gap-1 border-r p-3">
              {activePresets.map((preset) => (
                <DateRangePresetButton
                  key={preset.label}
                  preset={preset}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          )}
          <Calendar
            mode="range"
            selected={range}
            onSelect={field.onChange}
            disabled={isDateDisabled}
            numberOfMonths={numberOfMonths}
            {...(range?.from ? { defaultMonth: range.from } : {})}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
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
    () =>
      ({
        ...DEFAULT_PRESET_LABELS,
        ...customPresetLabels,
      }) as PresetLabels,
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
