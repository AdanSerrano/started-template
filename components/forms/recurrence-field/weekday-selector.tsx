'use client'

import { memo, useCallback } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { RecurrenceDayOfWeek } from './types'
import { DAYS_OF_WEEK } from './types'

interface WeekdaySelectorProps {
  selected: RecurrenceDayOfWeek[]
  onChange: (days: RecurrenceDayOfWeek[]) => void
  labels: Record<RecurrenceDayOfWeek, string>
  disabled?: boolean | undefined
}

export const WeekdaySelector = memo(function WeekdaySelector({
  selected,
  onChange,
  labels,
  disabled,
}: WeekdaySelectorProps) {
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
