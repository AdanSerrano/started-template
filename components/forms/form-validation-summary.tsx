'use client'

import { memo, useMemo, useCallback } from 'react'
import type { FieldErrors, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface FormValidationSummaryProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  errors: FieldErrors<TFieldValues>
  fieldLabels?: Record<string, string> | undefined
  maxErrors?: number | undefined
  variant?: 'default' | 'compact' | 'inline' | undefined
  showIcon?: boolean | undefined
  collapsible?: boolean | undefined
  defaultOpen?: boolean | undefined
  onErrorClick?: ((fieldName: string) => void) | undefined
  onDismiss?: (() => void) | undefined
  labels?:
    | {
        title?: string | undefined
        singleError?: string | undefined
        multipleErrors?: string | undefined
        showMore?: string | undefined
        showLess?: string | undefined
      }
    | undefined
  className?: string | undefined
}

interface FlatError {
  field: string
  message: string
}

function flattenErrors(errors: FieldErrors, prefix = ''): FlatError[] {
  const result: FlatError[] = []

  for (const [key, value] of Object.entries(errors)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key

    if (value?.message && typeof value.message === 'string') {
      result.push({ field: fieldPath, message: value.message })
    } else if (typeof value === 'object' && value !== null) {
      result.push(...flattenErrors(value as FieldErrors, fieldPath))
    }
  }

  return result
}

const ErrorItem = memo(function ErrorItemComponent({
  field,
  message,
  fieldLabel,
  onClick,
}: {
  field: string
  message: string
  fieldLabel: string
  onClick: (field: string) => void
}) {
  const handleClick = useCallback(() => {
    onClick(field)
  }, [field, onClick])

  return (
    <li className="flex items-start gap-2">
      <span className="text-destructive mt-0.5">&bull;</span>
      <button
        type="button"
        onClick={handleClick}
        className="text-left text-sm hover:underline focus:underline focus:outline-hidden"
      >
        <span className="font-medium">{fieldLabel}:</span>{' '}
        <span className="text-muted-foreground">{message}</span>
      </button>
    </li>
  )
})

function FormValidationSummaryComponent<
  TFieldValues extends FieldValues = FieldValues,
>({
  errors,
  fieldLabels = {},
  maxErrors = 5,
  variant = 'default',
  showIcon = true,
  collapsible = false,
  defaultOpen = true,
  onErrorClick,
  onDismiss,
  labels,
  className,
}: FormValidationSummaryProps<TFieldValues>) {
  const mergedLabels = {
    title: 'Please fix the following errors:',
    singleError: 'error',
    multipleErrors: 'errors',
    showMore: 'Show all',
    showLess: 'Show less',
    ...labels,
  }

  const flatErrors = useMemo(() => flattenErrors(errors), [errors])

  const visibleErrors = useMemo(
    () => flatErrors.slice(0, maxErrors),
    [flatErrors, maxErrors],
  )

  const hasMore = flatErrors.length > maxErrors
  const errorCount = flatErrors.length

  const getFieldLabel = useCallback(
    (fieldName: string) => {
      return fieldLabels[fieldName] ?? fieldName.split('.').pop() ?? fieldName
    },
    [fieldLabels],
  )

  const handleErrorClick = useCallback(
    (fieldName: string) => {
      if (onErrorClick) {
        onErrorClick(fieldName)
      } else {
        const element = document.querySelector(`[name="${fieldName}"]`)
        if (element instanceof HTMLElement) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    },
    [onErrorClick],
  )

  if (errorCount === 0) return null

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'text-destructive flex items-center gap-2 text-sm',
          className,
        )}
      >
        {showIcon && <AlertCircle className="h-4 w-4 shrink-0" />}
        <span>
          {errorCount}{' '}
          {errorCount === 1
            ? mergedLabels.singleError
            : mergedLabels.multipleErrors}
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'border-destructive/50 bg-destructive/10 flex items-center justify-between gap-2 rounded-lg border px-4 py-2',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {showIcon && (
            <AlertTriangle className="text-destructive h-4 w-4 shrink-0" />
          )}
          <span className="text-sm font-medium">
            {errorCount}{' '}
            {errorCount === 1
              ? mergedLabels.singleError
              : mergedLabels.multipleErrors}
          </span>
        </div>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  const content = (
    <div className="space-y-2">
      <ul className="space-y-1">
        {visibleErrors.map(({ field, message }) => (
          <ErrorItem
            key={field}
            field={field}
            message={message}
            fieldLabel={getFieldLabel(field)}
            onClick={handleErrorClick}
          />
        ))}
      </ul>
      {hasMore && (
        <p className="text-muted-foreground text-xs">
          +{flatErrors.length - maxErrors} more{' '}
          {flatErrors.length - maxErrors === 1 ? 'error' : 'errors'}
        </p>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className={className}>
        <div
          className={cn(
            'border-destructive/50 bg-destructive/10 overflow-hidden rounded-lg border',
          )}
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="hover:bg-destructive/5 flex w-full items-center justify-between px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                {showIcon && (
                  <AlertTriangle className="text-destructive h-4 w-4 shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {mergedLabels.title}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({errorCount}{' '}
                  {errorCount === 1
                    ? mergedLabels.singleError
                    : mergedLabels.multipleErrors}
                  )
                </span>
              </div>
              <ChevronDown className="text-muted-foreground h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-destructive/20 border-t px-4 pt-3 pb-3">
              {content}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div
      className={cn(
        'border-destructive/50 bg-destructive/10 rounded-lg border p-4',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {showIcon && (
            <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-medium">{mergedLabels.title}</p>
        </div>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mt-1 -mr-1 h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {content}
    </div>
  )
}

export const FormValidationSummary = memo(
  FormValidationSummaryComponent,
) as typeof FormValidationSummaryComponent
