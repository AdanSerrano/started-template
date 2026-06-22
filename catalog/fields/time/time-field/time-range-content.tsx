'use client'

import { Clock } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import type { TimeValue, TimeRange } from '@/components/forms/form-field.types'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatTime } from './time-utils'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

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

export interface TimeRangeContentProps {
  field: ControllerRenderProps<FieldValues, string>
  disabled?: boolean | undefined
  hasError: boolean
  format: '12h' | '24h'
  hours: number[]
  minutes: number[]
  mergedLabels: { from: string; to: string }
}

export const TimeRangeContent = memo(function TimeRangeContent({
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
