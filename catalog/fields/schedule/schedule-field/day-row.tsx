'use client'

import { Copy } from 'lucide-react'
import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { TimeSlotInput } from './time-slot-input'
import type { DayRowProps } from './types'

export const DayRow = memo(function DayRow({
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
