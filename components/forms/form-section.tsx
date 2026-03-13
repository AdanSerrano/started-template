'use client'

import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export interface FormSectionProps {
  title?: string | undefined
  description?: string | undefined
  children: ReactNode
  className?: string | undefined
  showSeparator?: boolean | undefined
}

function FormSectionComponent({
  title,
  description,
  children,
  className,
  showSeparator = false,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      )}
      {showSeparator && <Separator />}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export const FormSection = memo(FormSectionComponent)
FormSection.displayName = 'FormSection'

export interface FormFieldRowProps {
  children: ReactNode
  className?: string | undefined
  columns?: 1 | 2 | 3 | 4 | undefined
  gap?: 'sm' | 'md' | 'lg' | undefined
}

function FormFieldRowComponent({
  children,
  className,
  columns = 2,
  gap = 'md',
}: FormFieldRowProps) {
  const columnsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap]

  return (
    <div className={cn('grid', columnsClass, gapClass, className)}>
      {children}
    </div>
  )
}

export const FormFieldRow = memo(FormFieldRowComponent)
FormFieldRow.displayName = 'FormFieldRow'

export interface FormDividerProps {
  label?: string | undefined
  className?: string | undefined
}

function FormDividerComponent({ label, className }: FormDividerProps) {
  if (!label) {
    return <Separator className={className} />
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background text-muted-foreground px-2">
          {label}
        </span>
      </div>
    </div>
  )
}

export const FormDivider = memo(FormDividerComponent)
FormDivider.displayName = 'FormDivider'

export interface FormContainerProps {
  children: ReactNode
  className?: string | undefined
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined
}

function FormContainerComponent({
  children,
  className,
  maxWidth = 'full',
}: FormContainerProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'w-full',
  }[maxWidth]

  return (
    <div className={cn('space-y-6', maxWidthClass, className)}>{children}</div>
  )
}

export const FormContainer = memo(FormContainerComponent)
FormContainer.displayName = 'FormContainer'
