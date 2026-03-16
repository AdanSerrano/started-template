'use client'

import { memo, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { WeekdaySelector } from './weekday-selector'
import { getRecurrenceDescription } from './recurrence-utils'
import type {
  RecurrenceFrequency,
  RecurrenceDayOfWeek,
  EndType,
  RecurrenceValue,
  RecurrenceContentProps,
} from './types'
import { DEFAULT_VALUE } from './types'

export const RecurrenceContent = memo(function RecurrenceContent({
  field,
  hasError,
  disabled,
  showPreview,
  maxInterval,
  labels,
}: RecurrenceContentProps) {
  const value = (field.value || DEFAULT_VALUE) as RecurrenceValue

  const handleIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange({
        ...value,
        interval: Math.max(1, parseInt(e.target.value, 10) || 1),
      })
    },
    [field, value],
  )

  const handleFrequencyChange = useCallback(
    (v: string) => {
      field.onChange({ ...value, frequency: v as RecurrenceFrequency })
    },
    [field, value],
  )

  const handleDaysChange = useCallback(
    (days: RecurrenceDayOfWeek[]) => {
      field.onChange({ ...value, daysOfWeek: days })
    },
    [field, value],
  )

  const handleEndTypeChange = useCallback(
    (v: string) => {
      field.onChange({ ...value, endType: v as EndType })
    },
    [field, value],
  )

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      field.onChange({ ...value, endDate: date })
    },
    [field, value],
  )

  const handleEndCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange({
        ...value,
        endCount: Math.max(1, parseInt(e.target.value, 10) || 1),
      })
    },
    [field, value],
  )

  const containerClasses = useMemo(
    () =>
      cn('rounded-lg border p-4 space-y-4', hasError && 'border-destructive'),
    [hasError],
  )

  return (
    <div className={containerClasses}>
      <div className="flex flex-wrap items-center gap-3">
        <Repeat className="text-foreground/60 h-5 w-5" />

        <div className="flex items-center gap-2">
          <span className="text-sm">{labels.interval}</span>
          <Input
            type="number"
            min={1}
            max={maxInterval}
            value={value.interval}
            onChange={handleIntervalChange}
            disabled={disabled ?? false}
            className="bg-background w-16"
          />
        </div>

        <Select
          value={value.frequency}
          onValueChange={handleFrequencyChange}
          disabled={disabled ?? false}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">
              {value.interval === 1 ? 'day' : 'days'}
            </SelectItem>
            <SelectItem value="weekly">
              {value.interval === 1 ? 'week' : 'weeks'}
            </SelectItem>
            <SelectItem value="monthly">
              {value.interval === 1 ? 'month' : 'months'}
            </SelectItem>
            <SelectItem value="yearly">
              {value.interval === 1 ? 'year' : 'years'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.frequency === 'weekly' && (
        <div className="pl-9">
          <WeekdaySelector
            selected={value.daysOfWeek || []}
            onChange={handleDaysChange}
            labels={labels.days}
            disabled={disabled ?? false}
          />
        </div>
      )}

      <div className="space-y-3 pl-9">
        <span className="text-sm font-medium">{labels.ends}</span>
        <RadioGroup
          value={value.endType}
          onValueChange={handleEndTypeChange}
          disabled={disabled ?? false}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never" className="font-normal">
              {labels.never}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="date" id="date" />
            <Label htmlFor="date" className="font-normal">
              {labels.onDate}
            </Label>
            {value.endType === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled ?? false}
                    className="ml-2"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value.endDate
                      ? format(value.endDate, 'MMM d, yyyy')
                      : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value.endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="count" />
            <Label htmlFor="count" className="font-normal">
              {labels.afterOccurrences}
            </Label>
            {value.endType === 'count' && (
              <>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={value.endCount || 1}
                  onChange={handleEndCountChange}
                  disabled={disabled ?? false}
                  className="bg-background ml-2 w-16"
                />
                <span className="text-muted-foreground text-sm">
                  {labels.occurrences}
                </span>
              </>
            )}
          </div>
        </RadioGroup>
      </div>

      {showPreview && (
        <div className="border-t pt-2 pl-9">
          <p className="text-muted-foreground text-sm">
            {getRecurrenceDescription(value)}
          </p>
        </div>
      )}
    </div>
  )
})
