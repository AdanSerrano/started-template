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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TimeSlot {
  start: string
  end: string
}

export interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

export type WeekSchedule = Record<DayOfWeek, DaySchedule>

export interface FormScheduleFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  allowMultipleSlots?: boolean | undefined
  maxSlotsPerDay?: number | undefined
  showCopyButton?: boolean | undefined
  use24Hour?: boolean | undefined
  labels?:
    | {
        days?: Record<DayOfWeek, string> | undefined
        addSlot?: string | undefined
        copyToAll?: string | undefined
      }
    | undefined
}

const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const DEFAULT_LABELS = {
  days: {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  } as Record<DayOfWeek, string>,
  addSlot: 'Add slot',
  copyToAll: 'Copy to all',
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  sunday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
}

interface TimeSlotInputProps {
  slot: TimeSlot
  index: number
  showDelete: boolean
  onChange: (index: number, field: 'start' | 'end', value: string) => void
  onDelete: (index: number) => void
  disabled?: boolean | undefined
}

const TimeSlotInput = memo(function TimeSlotInput({
  slot,
  index,
  showDelete,
  onChange,
  onDelete,
  disabled,
}: TimeSlotInputProps) {
  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, 'start', e.target.value)
    },
    [onChange, index],
  )

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, 'end', e.target.value)
    },
    [onChange, index],
  )

  const handleDelete = useCallback(() => {
    onDelete(index)
  }, [onDelete, index])

  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={slot.start}
        onChange={handleStartChange}
        disabled={disabled ?? false}
        className="bg-background w-[100px]"
      />
      <span className="text-muted-foreground">-</span>
      <Input
        type="time"
        value={slot.end}
        onChange={handleEndChange}
        disabled={disabled ?? false}
        className="bg-background w-[100px]"
      />
      {showDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={disabled ?? false}
          className="text-muted-foreground hover:text-destructive h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
})

interface DayRowProps {
  day: DayOfWeek
  dayLabel: string
  schedule: DaySchedule
  allowMultipleSlots: boolean
  maxSlots: number
  addSlotLabel: string
  showCopyButton: boolean
  copyLabel: string
  onToggle: (day: DayOfWeek) => void
  onSlotChange: (
    day: DayOfWeek,
    index: number,
    field: 'start' | 'end',
    value: string,
  ) => void
  onSlotDelete: (day: DayOfWeek, index: number) => void
  onSlotAdd: (day: DayOfWeek) => void
  onCopyToAll: (day: DayOfWeek) => void
  disabled?: boolean | undefined
}

const DayRow = memo(function DayRow({
  day,
  dayLabel,
  schedule,
  allowMultipleSlots,
  maxSlots,
  addSlotLabel,
  showCopyButton,
  copyLabel,
  onToggle,
  onSlotChange,
  onSlotDelete,
  onSlotAdd,
  onCopyToAll,
  disabled,
}: DayRowProps) {
  const handleToggle = useCallback(() => {
    onToggle(day)
  }, [onToggle, day])

  const handleSlotAdd = useCallback(() => {
    onSlotAdd(day)
  }, [onSlotAdd, day])

  const handleCopyToAll = useCallback(() => {
    onCopyToAll(day)
  }, [onCopyToAll, day])

  const handleSlotChange = useCallback(
    (index: number, field: 'start' | 'end', value: string) => {
      onSlotChange(day, index, field, value)
    },
    [onSlotChange, day],
  )

  const handleSlotDelete = useCallback(
    (index: number) => {
      onSlotDelete(day, index)
    },
    [onSlotDelete, day],
  )

  return (
    <div className="flex items-start gap-4 border-b py-3 last:border-0">
      <div className="flex w-20 items-center gap-2 pt-1">
        <Switch
          checked={schedule.enabled}
          onCheckedChange={handleToggle}
          disabled={disabled ?? false}
        />
        <span
          className={cn(
            'text-sm font-medium',
            !schedule.enabled && 'text-muted-foreground',
          )}
        >
          {dayLabel}
        </span>
      </div>

      <div className="flex-1">
        {schedule.enabled ? (
          <div className="space-y-2">
            {schedule.slots.map((slot, index) => (
              <TimeSlotInput
                key={index}
                slot={slot}
                index={index}
                showDelete={schedule.slots.length > 1}
                onChange={handleSlotChange}
                onDelete={handleSlotDelete}
                disabled={disabled ?? false}
              />
            ))}
            <div className="flex gap-2">
              {allowMultipleSlots && schedule.slots.length < maxSlots && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSlotAdd}
                  disabled={disabled ?? false}
                  className="text-xs"
                >
                  + {addSlotLabel}
                </Button>
              )}
              {showCopyButton && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToAll}
                  disabled={disabled ?? false}
                  className="text-muted-foreground text-xs"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {copyLabel}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground block pt-1 text-sm">
            Closed
          </span>
        )}
      </div>
    </div>
  )
})

interface ScheduleContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  allowMultipleSlots: boolean
  maxSlotsPerDay: number
  showCopyButton: boolean
  labels: {
    days: Record<DayOfWeek, string>
    addSlot: string
    copyToAll: string
  }
}

const ScheduleContent = memo(function ScheduleContent({
  field,
  hasError,
  disabled,
  allowMultipleSlots,
  maxSlotsPerDay,
  showCopyButton,
  labels,
}: ScheduleContentProps) {
  const schedule = (field.value || DEFAULT_SCHEDULE) as WeekSchedule

  const handleToggle = useCallback(
    (day: DayOfWeek) => {
      field.onChange({
        ...schedule,
        [day]: { ...schedule[day], enabled: !schedule[day].enabled },
      })
    },
    [field, schedule],
  )

  const handleSlotChange = useCallback(
    (
      day: DayOfWeek,
      index: number,
      slotField: 'start' | 'end',
      value: string,
    ) => {
      const newSlots = [...schedule[day].slots]
      newSlots[index] = { ...newSlots[index]!, [slotField]: value }
      field.onChange({
        ...schedule,
        [day]: { ...schedule[day], slots: newSlots },
      })
    },
    [field, schedule],
  )

  const handleSlotDelete = useCallback(
    (day: DayOfWeek, index: number) => {
      const newSlots = schedule[day].slots.filter((_, i) => i !== index)
      field.onChange({
        ...schedule,
        [day]: { ...schedule[day], slots: newSlots },
      })
    },
    [field, schedule],
  )

  const handleSlotAdd = useCallback(
    (day: DayOfWeek) => {
      const lastSlot = schedule[day].slots[schedule[day].slots.length - 1]
      const newSlot: TimeSlot = {
        start: lastSlot?.end || '09:00',
        end: '17:00',
      }
      field.onChange({
        ...schedule,
        [day]: { ...schedule[day], slots: [...schedule[day].slots, newSlot] },
      })
    },
    [field, schedule],
  )

  const handleCopyToAll = useCallback(
    (sourceDay: DayOfWeek) => {
      const sourceSchedule = schedule[sourceDay]
      const newSchedule = { ...schedule }
      DAYS_ORDER.forEach((day) => {
        if (day !== sourceDay) {
          newSchedule[day] = {
            enabled: sourceSchedule.enabled,
            slots: sourceSchedule.slots.map((s) => ({ ...s })),
          }
        }
      })
      field.onChange(newSchedule)
    },
    [field, schedule],
  )

  const containerClasses = useMemo(
    () => cn('rounded-lg border p-4', hasError && 'border-destructive'),
    [hasError],
  )

  return (
    <div className={containerClasses}>
      {DAYS_ORDER.map((day) => (
        <DayRow
          key={day}
          day={day}
          dayLabel={labels.days[day]}
          schedule={schedule[day]}
          allowMultipleSlots={allowMultipleSlots}
          maxSlots={maxSlotsPerDay}
          addSlotLabel={labels.addSlot}
          showCopyButton={showCopyButton}
          copyLabel={labels.copyToAll}
          onToggle={handleToggle}
          onSlotChange={handleSlotChange}
          onSlotDelete={handleSlotDelete}
          onSlotAdd={handleSlotAdd}
          onCopyToAll={handleCopyToAll}
          disabled={disabled ?? false}
        />
      ))}
    </div>
  )
})

function FormScheduleFieldComponent<
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
  allowMultipleSlots = true,
  maxSlotsPerDay = 3,
  showCopyButton = true,
  labels: customLabels,
}: FormScheduleFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () =>
      ({
        days: { ...DEFAULT_LABELS.days, ...customLabels?.days },
        addSlot: customLabels?.addSlot ?? DEFAULT_LABELS.addSlot,
        copyToAll: customLabels?.copyToAll ?? DEFAULT_LABELS.copyToAll,
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
            <ScheduleContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              allowMultipleSlots={allowMultipleSlots}
              maxSlotsPerDay={maxSlotsPerDay}
              showCopyButton={showCopyButton}
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

export const FormScheduleField = memo(
  FormScheduleFieldComponent,
) as typeof FormScheduleFieldComponent
