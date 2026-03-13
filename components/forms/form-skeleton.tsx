'use client'

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface FormSkeletonFieldProps {
  showLabel?: boolean | undefined
  showDescription?: boolean | undefined
  inputHeight?: 'sm' | 'md' | 'lg' | 'textarea' | undefined
  className?: string | undefined
}

function FormSkeletonFieldComponent({
  showLabel = true,
  showDescription = false,
  inputHeight = 'md',
  className,
}: FormSkeletonFieldProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    textarea: 'h-24',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && <Skeleton className="h-4 w-24" />}
      <Skeleton className={cn('w-full', heights[inputHeight])} />
      {showDescription && <Skeleton className="h-3 w-48" />}
    </div>
  )
}

export const FormSkeletonField = memo(FormSkeletonFieldComponent)
FormSkeletonField.displayName = 'FormSkeletonField'

export interface FormSkeletonProps {
  fields?: number | undefined
  showLabels?: boolean | undefined
  showDescriptions?: boolean | undefined
  columns?: 1 | 2 | 3 | undefined
  showSubmitButton?: boolean | undefined
  className?: string | undefined
}

function FormSkeletonComponent({
  fields = 3,
  showLabels = true,
  showDescriptions = false,
  columns = 1,
  showSubmitButton = true,
  className,
}: FormSkeletonProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns]

  return (
    <div className={cn('space-y-6', className)}>
      <div className={cn('grid gap-4', gridClass)}>
        {Array.from({ length: fields }).map((_, index) => (
          <FormSkeletonField
            key={index}
            showLabel={showLabels}
            showDescription={showDescriptions}
          />
        ))}
      </div>
      {showSubmitButton && <Skeleton className="h-10 w-32" />}
    </div>
  )
}

export const FormSkeleton = memo(FormSkeletonComponent)
FormSkeleton.displayName = 'FormSkeleton'

export interface FormSkeletonSectionProps {
  title?: boolean | undefined
  description?: boolean | undefined
  fields?: number | undefined
  className?: string | undefined
}

function FormSkeletonSectionComponent({
  title = true,
  description = false,
  fields = 2,
  className,
}: FormSkeletonSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          {description && <Skeleton className="h-4 w-64" />}
        </div>
      )}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <FormSkeletonField key={index} />
        ))}
      </div>
    </div>
  )
}

export const FormSkeletonSection = memo(FormSkeletonSectionComponent)
FormSkeletonSection.displayName = 'FormSkeletonSection'
