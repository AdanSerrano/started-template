'use client'

import { memo, useCallback, useMemo } from 'react'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
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
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import type { BaseFormFieldProps, DatePreset } from '../form-field.types'
import { FormFieldTooltip } from '../form-field-tooltip'
import {
  DEFAULT_PRESET_LABELS,
  buildDatePresets,
  type PresetLabels,
} from './date-presets'

export interface FormDateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minDate?: Date | undefined
  maxDate?: Date | undefined
  disabledDates?: Date[] | undefined
  disabledDays?: ((date: Date) => boolean) | undefined
  locale?: string | undefined
  formatDate?: ((date: Date) => string) | undefined
  triggerClassName?: string | undefined
  presets?: DatePreset[] | undefined
  showPresets?: boolean | undefined
  presetLabels?: Partial<PresetLabels> | undefined
}

const defaultFormatDate = (date: Date, locale = 'en-US') =>
  date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

interface PresetButtonProps {
  preset: DatePreset
  onSelect: (preset: DatePreset) => void
}

const PresetButton = memo(function PresetButton({
  preset,
  onSelect,
}: PresetButtonProps) {
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

interface DateContentProps {
  field: ControllerRenderProps<FieldValues, string>
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
  format: (date: Date) => string
  isDateDisabled: (date: Date) => boolean
  activePresets: DatePreset[]
}

const DateContent = memo(function DateContent({
  field,
  placeholder,
  disabled,
  hasError,
  triggerClassName,
  format,
  isDateDisabled,
  activePresets,
}: DateContentProps) {
  const handlePresetSelect = useCallback(
    (preset: DatePreset) => {
      const date = preset.getValue()
      field.onChange(date)
    },
    [field],
  )

  const buttonClasses = useMemo(
    () =>
      cn(
        'w-full justify-start text-left font-normal bg-background',
        !field.value && 'text-muted-foreground',
        hasError && 'border-destructive',
        triggerClassName,
      ),
    [field.value, hasError, triggerClassName],
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
            {field.value ? format(field.value) : placeholder}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {activePresets.length > 0 && (
            <div className="flex flex-col gap-1 border-r p-3">
              {activePresets.map((preset) => (
                <PresetButton
                  key={preset.label}
                  preset={preset}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          )}
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={isDateDisabled}
            defaultMonth={field.value}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})

function FormDateFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Pick a date',
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
  triggerClassName,
  presets,
  showPresets = false,
  presetLabels: customPresetLabels,
}: FormDateFieldProps<TFieldValues, TName>) {
  const mergedPresetLabels = useMemo(
    () =>
      ({
        ...DEFAULT_PRESET_LABELS,
        ...customPresetLabels,
      }) as PresetLabels,
    [customPresetLabels],
  )

  const defaultPresets = useMemo(
    () => buildDatePresets(mergedPresetLabels),
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
          <DateContent
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

export const FormDateField = memo(
  FormDateFieldComponent,
) as typeof FormDateFieldComponent
