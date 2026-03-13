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
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import type {
  BaseFormFieldProps,
  TimeValue,
  TimeRange,
} from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormTimeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  format?: '12h' | '24h' | undefined
  minuteStep?: 1 | 5 | 10 | 15 | 30 | undefined
  minTime?: TimeValue | undefined
  maxTime?: TimeValue | undefined
  triggerClassName?: string | undefined
}

function formatTime(time: TimeValue, format: '12h' | '24h'): string {
  const { hours, minutes } = time
  const paddedMinutes = minutes.toString().padStart(2, '0')

  if (format === '24h') {
    const paddedHours = hours.toString().padStart(2, '0')
    return `${paddedHours}:${paddedMinutes}`
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${paddedMinutes} ${period}`
}

function generateHours(format: '12h' | '24h'): number[] {
  if (format === '24h') {
    return Array.from({ length: 24 }, (_, i) => i)
  }
  return Array.from({ length: 12 }, (_, i) => i || 12)
}

function generateMinutes(step: number): number[] {
  return Array.from({ length: 60 / step }, (_, i) => i * step)
}

function isTimeDisabled(
  hours: number,
  minutes: number,
  minTime?: TimeValue,
  maxTime?: TimeValue,
): boolean {
  const timeInMinutes = hours * 60 + minutes

  if (minTime) {
    const minInMinutes = minTime.hours * 60 + minTime.minutes
    if (timeInMinutes < minInMinutes) return true
  }

  if (maxTime) {
    const maxInMinutes = maxTime.hours * 60 + maxTime.minutes
    if (timeInMinutes > maxInMinutes) return true
  }

  return false
}

interface HourButtonProps {
  hour: number
  isSelected: boolean
  computedHour: number
  currentMinutes: number
  onSelect: (h: number, m: number) => void
}

const HourButton = memo(function HourButton({
  hour,
  isSelected,
  computedHour,
  currentMinutes,
  onSelect,
}: HourButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(computedHour, currentMinutes)
  }, [computedHour, currentMinutes, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      onClick={handleClick}
    >
      {hour.toString().padStart(2, '0')}
    </Button>
  )
})

interface MinuteButtonProps {
  minute: number
  isSelected: boolean
  isDisabled: boolean
  currentHours: number
  onSelect: (h: number, m: number) => void
}

const MinuteButton = memo(function MinuteButton({
  minute,
  isSelected,
  isDisabled,
  currentHours,
  onSelect,
}: MinuteButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(currentHours, minute)
  }, [currentHours, minute, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {minute.toString().padStart(2, '0')}
    </Button>
  )
})

interface PeriodButtonProps {
  period: 'AM' | 'PM'
  isSelected: boolean
  onSelect: (period: 'AM' | 'PM') => void
}

const PeriodButton = memo(function PeriodButton({
  period,
  isSelected,
  onSelect,
}: PeriodButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(period)
  }, [period, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      onClick={handleClick}
    >
      {period}
    </Button>
  )
})

interface TimeContentProps {
  field: ControllerRenderProps<FieldValues, string>
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
  format: '12h' | '24h'
  hours: number[]
  minutes: number[]
  minTime?: TimeValue | undefined
  maxTime?: TimeValue | undefined
}

const TimeContent = memo(function TimeContent({
  field,
  placeholder,
  disabled,
  hasError,
  triggerClassName,
  format,
  hours,
  minutes,
  minTime,
  maxTime,
}: TimeContentProps) {
  const value: TimeValue | undefined = field.value

  const handleSelect = useCallback(
    (h: number, m: number) => {
      let actualHours = h
      if (format === '12h' && value) {
        const isPM = (value.hours ?? 0) >= 12
        if (h === 12) {
          actualHours = isPM ? 12 : 0
        } else {
          actualHours = isPM ? h + 12 : h
        }
      }
      field.onChange({ hours: actualHours, minutes: m })
    },
    [field, format, value],
  )

  const handlePeriodChange = useCallback(
    (period: 'AM' | 'PM') => {
      if (!value) return
      let newHours = value.hours
      if (period === 'AM' && newHours >= 12) {
        newHours -= 12
      } else if (period === 'PM' && newHours < 12) {
        newHours += 12
      }
      field.onChange({ ...value, hours: newHours })
    },
    [field, value],
  )

  const currentPeriod = value ? (value.hours >= 12 ? 'PM' : 'AM') : 'AM'
  const displayHours = value
    ? format === '12h'
      ? value.hours % 12 || 12
      : value.hours
    : null

  const currentMinutes = value?.minutes ?? 0
  const currentHours = value?.hours ?? 0

  const triggerClasses = useMemo(
    () =>
      cn(
        'w-full justify-start text-left font-normal bg-background',
        !value && 'text-muted-foreground',
        hasError && 'border-destructive',
        triggerClassName,
      ),
    [value, hasError, triggerClassName],
  )

  const computeHour = useCallback(
    (h: number) => {
      if (format === '12h' && currentPeriod === 'PM' && h !== 12) {
        return h + 12
      }
      if (format === '12h' && currentPeriod === 'AM' && h === 12) {
        return 0
      }
      return h
    },
    [format, currentPeriod],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            disabled={disabled ?? false}
            className={triggerClasses}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? formatTime(value, format) : placeholder}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <ScrollArea className="h-[200px] w-[70px] border-r">
            <div className="p-2">
              {hours.map((h) => (
                <HourButton
                  key={h}
                  hour={h}
                  isSelected={displayHours === h}
                  computedHour={computeHour(h)}
                  currentMinutes={currentMinutes}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="h-[200px] w-[70px] border-r">
            <div className="p-2">
              {minutes.map((m) => (
                <MinuteButton
                  key={m}
                  minute={m}
                  isSelected={value?.minutes === m}
                  isDisabled={Boolean(
                    value && isTimeDisabled(value.hours, m, minTime, maxTime),
                  )}
                  currentHours={currentHours}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </ScrollArea>
          {format === '12h' && (
            <div className="flex flex-col gap-1 p-2">
              <PeriodButton
                period="AM"
                isSelected={currentPeriod === 'AM'}
                onSelect={handlePeriodChange}
              />
              <PeriodButton
                period="PM"
                isSelected={currentPeriod === 'PM'}
                onSelect={handlePeriodChange}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})

function FormTimeFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Select time',
  disabled,
  className,
  required,
  tooltip,
  format = '12h',
  minuteStep = 15,
  minTime,
  maxTime,
  triggerClassName,
}: FormTimeFieldProps<TFieldValues, TName>) {
  const hours = useMemo(() => generateHours(format), [format])
  const minutes = useMemo(() => generateMinutes(minuteStep), [minuteStep])

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
          <TimeContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            placeholder={placeholder}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
            format={format}
            hours={hours}
            minutes={minutes}
            minTime={minTime}
            maxTime={maxTime}
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

export const FormTimeField = memo(
  FormTimeFieldComponent,
) as typeof FormTimeFieldComponent

export interface FormTimeRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  format?: '12h' | '24h' | undefined
  minuteStep?: 1 | 5 | 10 | 15 | 30 | undefined
  labels?:
    | {
        from?: string | undefined
        to?: string | undefined
      }
    | undefined
}

interface RangeHourButtonProps {
  hour: number
  isSelected: boolean
  currentMinutes: number
  onSelect: (h: number, m: number) => void
}

const RangeHourButton = memo(function RangeHourButton({
  hour,
  isSelected,
  currentMinutes,
  onSelect,
}: RangeHourButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(hour, currentMinutes)
  }, [hour, currentMinutes, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      onClick={handleClick}
    >
      {hour.toString().padStart(2, '0')}
    </Button>
  )
})

interface RangeMinuteButtonProps {
  minute: number
  isSelected: boolean
  currentHours: number
  onSelect: (h: number, m: number) => void
}

const RangeMinuteButton = memo(function RangeMinuteButton({
  minute,
  isSelected,
  currentHours,
  onSelect,
}: RangeMinuteButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(currentHours, minute)
  }, [currentHours, minute, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      onClick={handleClick}
    >
      {minute.toString().padStart(2, '0')}
    </Button>
  )
})

interface TimeRangePickerProps {
  selectedTime: TimeValue | undefined
  onSelect: (hours: number, minutes: number) => void
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  format: '12h' | '24h'
  hours: number[]
  minutes: number[]
}

const TimeRangePicker = memo(function TimeRangePicker({
  selectedTime,
  onSelect,
  placeholder,
  disabled,
  hasError,
  format,
  hours,
  minutes,
}: TimeRangePickerProps) {
  const currentHours = selectedTime?.hours ?? 0
  const currentMinutes = selectedTime?.minutes ?? 0

  const triggerClasses = useMemo(
    () =>
      cn(
        'flex-1 justify-start text-left font-normal bg-background',
        !selectedTime && 'text-muted-foreground',
        hasError && 'border-destructive',
      ),
    [selectedTime, hasError],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled ?? false}
          className={triggerClasses}
        >
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime ? formatTime(selectedTime, format) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <ScrollArea className="h-[200px] w-[70px] border-r">
            <div className="p-2">
              {hours.map((h) => (
                <RangeHourButton
                  key={h}
                  hour={h}
                  isSelected={selectedTime?.hours === h}
                  currentMinutes={currentMinutes}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="h-[200px] w-[70px]">
            <div className="p-2">
              {minutes.map((m) => (
                <RangeMinuteButton
                  key={m}
                  minute={m}
                  isSelected={selectedTime?.minutes === m}
                  currentHours={currentHours}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
})

interface TimeRangeContentProps {
  field: ControllerRenderProps<FieldValues, string>
  disabled?: boolean | undefined
  hasError: boolean
  format: '12h' | '24h'
  hours: number[]
  minutes: number[]
  mergedLabels: { from: string; to: string }
}

const TimeRangeContent = memo(function TimeRangeContent({
  field,
  disabled,
  hasError,
  format,
  hours,
  minutes,
  mergedLabels,
}: TimeRangeContentProps) {
  const value: TimeRange = useMemo(
    () => field.value ?? { from: undefined, to: undefined },
    [field.value],
  )

  const handleFromChange = useCallback(
    (h: number, m: number) => {
      field.onChange({ ...value, from: { hours: h, minutes: m } })
    },
    [field, value],
  )

  const handleToChange = useCallback(
    (h: number, m: number) => {
      field.onChange({ ...value, to: { hours: h, minutes: m } })
    },
    [field, value],
  )

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <span className="text-muted-foreground mb-1 block text-xs">
          {mergedLabels.from}
        </span>
        <TimeRangePicker
          selectedTime={value.from}
          onSelect={handleFromChange}
          placeholder="Start"
          disabled={disabled ?? false}
          hasError={hasError}
          format={format}
          hours={hours}
          minutes={minutes}
        />
      </div>
      <span className="text-muted-foreground mt-5">-</span>
      <div className="flex-1">
        <span className="text-muted-foreground mb-1 block text-xs">
          {mergedLabels.to}
        </span>
        <TimeRangePicker
          selectedTime={value.to}
          onSelect={handleToChange}
          placeholder="End"
          disabled={disabled ?? false}
          hasError={hasError}
          format={format}
          hours={hours}
          minutes={minutes}
        />
      </div>
    </div>
  )
})

function FormTimeRangeFieldComponent<
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
  tooltip,
  format = '12h',
  minuteStep = 15,
  labels,
}: FormTimeRangeFieldProps<TFieldValues, TName>) {
  const hours = useMemo(() => generateHours(format), [format])
  const minutes = useMemo(() => generateMinutes(minuteStep), [minuteStep])

  const mergedLabels = useMemo(
    () =>
      ({
        from: 'From',
        to: 'To',
        ...labels,
      }) as { from: string; to: string },
    [labels],
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
          <FormControl>
            <TimeRangeContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              format={format}
              hours={hours}
              minutes={minutes}
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

export const FormTimeRangeField = memo(
  FormTimeRangeFieldComponent,
) as typeof FormTimeRangeFieldComponent
