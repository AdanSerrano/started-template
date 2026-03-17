'use client'

import { X } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'

export interface SelectedBadgeProps {
  label: string
  value: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  onRemove: (value: string, e: React.MouseEvent) => void
}

export const SelectedBadge = memo(function SelectedBadge({
  label,
  value,
  variant,
  onRemove,
}: SelectedBadgeProps) {
  return (
    <Badge variant={variant} className="mr-1 gap-1">
      {label}
      <span
        role="button"
        tabIndex={0}
        className="ring-offset-background focus:ring-ring hover:bg-foreground/20 ml-1 cursor-pointer rounded-full outline-hidden focus:ring-2 focus:ring-offset-2"
        onClick={(e) => onRemove(value, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onRemove(value, e as unknown as React.MouseEvent)
          }
        }}
      >
        <X className="h-3 w-3" />
      </span>
    </Badge>
  )
})
