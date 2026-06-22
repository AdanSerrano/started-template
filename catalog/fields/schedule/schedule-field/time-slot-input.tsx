'use client'

import { Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TimeSlotInputProps } from './types'

export const TimeSlotInput = memo(function TimeSlotInput({
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
