'use client'

import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'

export interface ArrayItemControlsProps {
  index: number
  showIndex: boolean
  showReorder: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  canRemove: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  disabled?: boolean | undefined
}

export const ArrayItemControls = memo(function ArrayItemControls({
  index,
  showIndex,
  showReorder,
  canMoveUp,
  canMoveDown,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
  disabled,
}: ArrayItemControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {showIndex && (
        <span className="text-muted-foreground w-6 text-center font-mono text-xs">
          {index + 1}
        </span>
      )}
      {showReorder && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={disabled || !canMoveUp}
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={disabled || !canMoveDown}
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive h-7 w-7"
        onClick={onRemove}
        disabled={disabled || !canRemove}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
})
