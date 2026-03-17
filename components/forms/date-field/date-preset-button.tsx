'use client'

import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { DatePreset } from '../form-field.types'

interface PresetButtonProps {
  preset: DatePreset
  onSelect: (preset: DatePreset) => void
}

export const PresetButton = memo(function PresetButton({
  preset,
  onSelect,
}: PresetButtonProps) {
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
