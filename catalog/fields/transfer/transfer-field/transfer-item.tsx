'use client'

import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'

export interface TransferControlsProps {
  canMoveRight: boolean
  canMoveLeft: boolean
  canMoveAllRight: boolean
  canMoveAllLeft: boolean
  disabled?: boolean | undefined
  labels: {
    moveRight: string
    moveLeft: string
    moveAllRight: string
    moveAllLeft: string
  }
  onMoveRight: () => void
  onMoveLeft: () => void
  onMoveAllRight: () => void
  onMoveAllLeft: () => void
}

export const TransferControls = memo(function TransferControls({
  canMoveRight,
  canMoveLeft,
  canMoveAllRight,
  canMoveAllLeft,
  disabled,
  labels,
  onMoveRight,
  onMoveLeft,
  onMoveAllRight,
  onMoveAllLeft,
}: TransferControlsProps) {
  return (
    <div className="flex flex-col justify-center gap-2 px-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMoveAllRight}
        disabled={disabled || !canMoveAllRight}
        className="h-8 w-8"
        title={labels.moveAllRight}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMoveRight}
        disabled={disabled || !canMoveRight}
        className="h-8 w-8"
        title={labels.moveRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMoveLeft}
        disabled={disabled || !canMoveLeft}
        className="h-8 w-8"
        title={labels.moveLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMoveAllLeft}
        disabled={disabled || !canMoveAllLeft}
        className="h-8 w-8"
        title={labels.moveAllLeft}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
    </div>
  )
})
