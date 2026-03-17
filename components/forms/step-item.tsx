'use client'

import { Check, Circle, Loader2 } from 'lucide-react'
import { memo, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { FormStep } from './form-step-indicator'

export type StepStatus = 'completed' | 'current' | 'upcoming'

export interface CompactStepButtonProps {
  index: number
  status: StepStatus
  allowNavigation: boolean
  onStepClick: (index: number) => void
}

export const CompactStepButton = memo(function CompactStepButton({
  index,
  status,
  allowNavigation,
  onStepClick,
}: CompactStepButtonProps) {
  const handleClick = useCallback(() => {
    onStepClick(index)
  }, [onStepClick, index])

  const buttonClasses = useMemo(
    () =>
      cn(
        'h-2 rounded-full transition-all',
        status === 'completed' && 'w-8 bg-primary',
        status === 'current' && 'w-8 bg-primary',
        status === 'upcoming' && 'w-2 bg-muted-foreground/30',
        allowNavigation &&
          status !== 'upcoming' &&
          'cursor-pointer hover:opacity-80',
      ),
    [status, allowNavigation],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!allowNavigation}
      className={buttonClasses}
    />
  )
})

export interface StepCircleButtonProps {
  index: number
  step: FormStep
  status: StepStatus
  allowNavigation: boolean
  isLoading: boolean
  variant: 'default' | 'compact' | 'numbered'
  onStepClick: (index: number) => void
}

export const StepCircleButton = memo(function StepCircleButton({
  index,
  step,
  status,
  allowNavigation,
  isLoading,
  variant,
  onStepClick,
}: StepCircleButtonProps) {
  const handleClick = useCallback(() => {
    onStepClick(index)
  }, [onStepClick, index])

  const buttonClasses = useMemo(
    () =>
      cn(
        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
        status === 'completed' &&
          'border-primary bg-primary text-primary-foreground',
        status === 'current' && 'border-primary bg-background text-primary',
        status === 'upcoming' &&
          'border-muted-foreground/30 bg-background text-muted-foreground',
        allowNavigation &&
          status !== 'upcoming' &&
          'cursor-pointer hover:opacity-80',
      ),
    [status, allowNavigation],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!allowNavigation}
      className={buttonClasses}
    >
      {isLoading && status === 'current' ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : status === 'completed' ? (
        <Check className="h-5 w-5" />
      ) : variant === 'numbered' ? (
        <span className="text-sm font-semibold">{index + 1}</span>
      ) : (
        (step.icon ?? <Circle className="h-3 w-3 fill-current" />)
      )}
    </button>
  )
})
