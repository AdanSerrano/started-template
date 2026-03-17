'use client'

import { Clock } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import type { TimeValue } from '@/components/forms/form-field.types'
import { Button } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { HourButton, MinuteButton, PeriodButton } from './time-buttons'
import { formatTime, isTimeDisabled } from './time-utils'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface TimeContentProps {
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

export const TimeContent = memo(function TimeContent({
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
