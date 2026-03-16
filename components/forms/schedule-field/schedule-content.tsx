'use client'

import { memo, useCallback, useMemo } from 'react'
import type { FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { DayRow } from './day-row'
import type {
  DayOfWeek,
  TimeSlot,
  WeekSchedule,
  ScheduleContentProps,
} from './types'
import { DAYS_ORDER, DEFAULT_SCHEDULE } from './types'

export const ScheduleContent = memo(function ScheduleContent({
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
