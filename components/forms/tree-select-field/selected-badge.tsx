'use client'

import { X } from 'lucide-react'
import { memo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import type { SelectedBadgeProps } from './types'

export const SelectedBadge = memo(function SelectedBadge({
  value,
  label,
  onRemove,
}: SelectedBadgeProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove(value, e)
    },
    [value, onRemove],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onRemove(value, e as unknown as React.MouseEvent)
      }
    },
    [value, onRemove],
  )

  return (
    <Badge variant="secondary" className="text-xs">
      {label}
      <span
        role="button"
        tabIndex={0}
        className="hover:text-destructive ml-1 cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <X className="h-3 w-3" />
      </span>
    </Badge>
  )
})
