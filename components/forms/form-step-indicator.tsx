'use client'

import { memo, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  CompactStepButton,
  StepCircleButton,
  type StepStatus,
} from './step-item'

export interface FormStep {
  id: string
  label: string
  description?: string | undefined
  icon?: ReactNode | undefined
}

export interface FormStepIndicatorProps {
  steps: FormStep[]
  currentStep: number
  completedSteps?: number[] | undefined
  orientation?: 'horizontal' | 'vertical' | undefined
  variant?: 'default' | 'compact' | 'numbered' | undefined
  showLabels?: boolean | undefined
  showDescriptions?: boolean | undefined
  isLoading?: boolean | undefined
  onStepClick?: ((stepIndex: number) => void) | undefined
  allowNavigation?: boolean | undefined
  className?: string | undefined
}

function FormStepIndicatorComponent({
  steps,
  currentStep,
  completedSteps = [],
  orientation = 'horizontal',
  variant = 'default',
  showLabels = true,
  showDescriptions = false,
  isLoading = false,
  onStepClick,
  allowNavigation = false,
  className,
}: FormStepIndicatorProps) {
  const getStepStatus = useCallback(
    (index: number): StepStatus => {
      if (completedSteps.includes(index)) return 'completed'
      if (index === currentStep) return 'current'
      return 'upcoming'
    },
    [currentStep, completedSteps],
  )

  const handleStepClick = useCallback(
    (index: number) => {
      if (!allowNavigation || !onStepClick) return
      const status = getStepStatus(index)
      if (
        status === 'completed' ||
        (status === 'upcoming' && index < currentStep)
      ) {
        onStepClick(index)
      }
    },
    [allowNavigation, onStepClick, getStepStatus, currentStep],
  )

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((_, index) => (
          <CompactStepButton
            key={index}
            index={index}
            status={getStepStatus(index)}
            allowNavigation={allowNavigation}
            onStepClick={handleStepClick}
          />
        ))}
      </div>
    )
  }

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1
          return (
            <div key={step.id} className="flex">
              <div className="mr-4 flex flex-col items-center">
                <StepCircleButton
                  index={index}
                  step={step}
                  status={status}
                  allowNavigation={allowNavigation}
                  isLoading={isLoading}
                  variant={variant}
                  onStepClick={handleStepClick}
                />
                {!isLast && (
                  <div
                    className={cn(
                      'my-1 min-h-[24px] w-0.5 flex-1',
                      completedSteps.includes(index)
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30',
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-8">
                {showLabels && (
                  <p
                    className={cn(
                      'leading-10 font-medium',
                      status === 'current' && 'text-primary',
                      status === 'upcoming' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                )}
                {showDescriptions && step.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1
          return (
            <div
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <div className="flex flex-col items-center">
                <StepCircleButton
                  index={index}
                  step={step}
                  status={status}
                  allowNavigation={allowNavigation}
                  isLoading={isLoading}
                  variant={variant}
                  onStepClick={handleStepClick}
                />
                {showLabels && (
                  <span
                    className={cn(
                      'mt-2 max-w-[80px] text-center text-xs font-medium',
                      status === 'current' && 'text-primary',
                      status === 'upcoming' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    completedSteps.includes(index)
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      {showDescriptions && steps[currentStep]?.description && (
        <p className="text-muted-foreground mt-4 text-center text-sm">
          {steps[currentStep].description}
        </p>
      )}
    </div>
  )
}

export const FormStepIndicator = memo(FormStepIndicatorComponent)
FormStepIndicator.displayName = 'FormStepIndicator'
