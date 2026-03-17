'use client'

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MoveUpButtonProps {
  index: number
  onMoveUp: (index: number) => void
  disabled: boolean
}

export const MoveUpButton = memo(function MoveUpButton({
  index,
  onMoveUp,
  disabled,
}: MoveUpButtonProps) {
  const handleClick = useCallback(() => {
    onMoveUp(index)
  }, [onMoveUp, index])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={handleClick}
      disabled={disabled ?? false}
      aria-label="Move up"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  )
})

interface MoveDownButtonProps {
  index: number
  onMoveDown: (index: number) => void
  disabled: boolean
}

export const MoveDownButton = memo(function MoveDownButton({
  index,
  onMoveDown,
  disabled,
}: MoveDownButtonProps) {
  const handleClick = useCallback(() => {
    onMoveDown(index)
  }, [onMoveDown, index])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={handleClick}
      disabled={disabled ?? false}
      aria-label="Move down"
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
})

export interface RemoveButtonProps {
  index: number
  onRemove: (index: number) => void
  disabled: boolean
  variant: 'default' | 'card' | 'compact'
}

export const RemoveButton = memo(function RemoveButton({
  index,
  onRemove,
  disabled,
  variant,
}: RemoveButtonProps) {
  const handleClick = useCallback(() => {
    onRemove(index)
  }, [onRemove, index])

  const buttonClasses = useMemo(
    () =>
      cn(
        'h-8 w-8 text-muted-foreground hover:text-destructive shrink-0',
        variant === 'default' &&
          'opacity-0 group-hover:opacity-100 transition-opacity',
      ),
    [variant],
  )

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled ?? false}
      aria-label="Remove"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
})
