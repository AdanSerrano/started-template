'use client'

import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { DateRangePreset } from './date-presets'

interface DateRangePresetButtonProps {
  preset: DateRangePreset
  onSelect: (preset: DateRangePreset) => void
}

export const DateRangePresetButton = memo(function DateRangePresetButton({
  preset,
  onSelect,
}: DateRangePresetButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(preset)
  }, [preset, onSelect])

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="justify-start text-left"
      onClick={handleClick}
    >
      {preset.label}
    </Button>
  )
})
