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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
import type { BaseFormFieldProps } from './form-field.types'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type EndType = 'never' | 'date' | 'count'
export type RecurrenceDayOfWeek = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA'
export type MonthlyType = 'dayOfMonth' | 'dayOfWeek'

export interface RecurrenceValue {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: RecurrenceDayOfWeek[] | undefined
  monthlyType?: MonthlyType | undefined
  dayOfMonth?: number | undefined
  endType: EndType
  endDate?: Date | undefined
  endCount?: number | undefined
}

export interface FormRecurrenceFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showPreview?: boolean | undefined
  maxInterval?: number | undefined
  labels?:
    | {
        frequency?: string | undefined
        interval?: string | undefined
        days?: Record<RecurrenceDayOfWeek, string> | undefined
        ends?: string | undefined
        never?: string | undefined
        onDate?: string | undefined
        afterOccurrences?: string | undefined
        occurrences?: string | undefined
      }
    | undefined
}

const DAYS_OF_WEEK: RecurrenceDayOfWeek[] = [
  'SU',
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA',
]

const DEFAULT_LABELS = {
  frequency: 'Repeat',
  interval: 'Every',
  days: {
    SU: 'S',
    MO: 'M',
    TU: 'T',
    WE: 'W',
    TH: 'T',
    FR: 'F',
    SA: 'S',
  } as Record<RecurrenceDayOfWeek, string>,
  ends: 'Ends',
  never: 'Never',
  onDate: 'On date',
  afterOccurrences: 'After',
  occurrences: 'occurrences',
}

const FREQUENCY_LABELS: Record<
  RecurrenceFrequency,
  { singular: string; plural: string }
> = {
  daily: { singular: 'day', plural: 'days' },
  weekly: { singular: 'week', plural: 'weeks' },
  monthly: { singular: 'month', plural: 'months' },
  yearly: { singular: 'year', plural: 'years' },
}

const DEFAULT_VALUE: RecurrenceValue = {
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: ['MO'],
  endType: 'never',
}

function getRecurrenceDescription(value: RecurrenceValue): string {
  const freqLabel =
    value.interval === 1
      ? FREQUENCY_LABELS[value.frequency].singular
      : FREQUENCY_LABELS[value.frequency].plural

  let desc =
    value.interval === 1
      ? `Every ${freqLabel}`
      : `Every ${value.interval} ${freqLabel}`

  if (
    value.frequency === 'weekly' &&
    value.daysOfWeek &&
    value.daysOfWeek.length > 0
  ) {
    const dayNames = value.daysOfWeek.map((d) => {
      const index = DAYS_OF_WEEK.indexOf(d)
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]
    })
    desc += ` on ${dayNames.join(', ')}`
  }

  if (value.endType === 'date' && value.endDate) {
    desc += `, until ${format(value.endDate, 'MMM d, yyyy')}`
  } else if (value.endType === 'count' && value.endCount) {
    desc += `, ${value.endCount} times`
  }

  return desc
}

const WeekdaySelector = memo(function WeekdaySelector({
  selected,
  onChange,
  labels,
  disabled,
}: {
  selected: RecurrenceDayOfWeek[]
  onChange: (days: RecurrenceDayOfWeek[]) => void
  labels: Record<RecurrenceDayOfWeek, string>
  disabled?: boolean | undefined
}) {
  const handleChange = useCallback(
    (v: string[]) => {
      onChange(v as RecurrenceDayOfWeek[])
    },
    [onChange],
  )

  return (
    <ToggleGroup
      type="multiple"
      value={selected}
      onValueChange={handleChange}
      disabled={disabled ?? false}
      className="justify-start"
    >
      {DAYS_OF_WEEK.map((day) => (
        <ToggleGroupItem
          key={day}
          value={day}
          className="h-8 w-8 text-xs"
          aria-label={day}
        >
          {labels[day]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
})

interface RecurrenceContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showPreview: boolean
  maxInterval: number
  labels: typeof DEFAULT_LABELS
}

const RecurrenceContent = memo(function RecurrenceContent({
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
