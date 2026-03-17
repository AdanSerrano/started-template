'use client'

import { CalendarIcon } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { FormControl } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { DateRangePresetButton } from './date-range-preset-button'
import type { DateRangePreset } from './date-presets'
import type { DateRange } from '../form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface DateRangeContentProps {
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

export const DateRangeContent = memo(function DateRangeContent({
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
      field.onChange(preset.getValue())
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
