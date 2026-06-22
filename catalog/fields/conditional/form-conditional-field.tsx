'use client'

import { memo, useMemo, type ReactNode } from 'react'
import {
  useWatch,
  type Control,
  type FieldValues,
  type FieldPath,
  type PathValue,
} from 'react-hook-form'
import { cn } from '@/lib/utils'

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn'
  | 'matches'

export interface FieldCondition<
  TFieldValues extends FieldValues = FieldValues,
> {
  field: FieldPath<TFieldValues>
  operator: ConditionOperator
  value?:
    | PathValue<TFieldValues, FieldPath<TFieldValues>>
    | PathValue<TFieldValues, FieldPath<TFieldValues>>[]
    | undefined
}

export interface FormConditionalFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  conditions: FieldCondition<TFieldValues>[]
  logic?: 'and' | 'or' | undefined
  children: ReactNode
  fallback?: ReactNode | undefined
  className?: string | undefined
  animate?: boolean | undefined
}

function evaluateCondition<TFieldValues extends FieldValues>(
  condition: FieldCondition<TFieldValues>,
  watchedValue: unknown,
): boolean {
  const { operator, value } = condition

  switch (operator) {
    case 'equals':
      return watchedValue === value
    case 'notEquals':
      return watchedValue !== value
    case 'contains':
      if (typeof watchedValue === 'string' && typeof value === 'string') {
        return watchedValue.includes(value)
      }
      if (Array.isArray(watchedValue)) {
        return watchedValue.includes(value)
      }
      return false
    case 'notContains':
      if (typeof watchedValue === 'string' && typeof value === 'string') {
        return !watchedValue.includes(value)
      }
      if (Array.isArray(watchedValue)) {
        return !watchedValue.includes(value)
      }
      return true
    case 'greaterThan':
      return (
        typeof watchedValue === 'number' &&
        typeof value === 'number' &&
        watchedValue > value
      )
    case 'lessThan':
      return (
        typeof watchedValue === 'number' &&
        typeof value === 'number' &&
        watchedValue < value
      )
    case 'isEmpty':
      return (
        watchedValue === null ||
        watchedValue === undefined ||
        watchedValue === '' ||
        (Array.isArray(watchedValue) && watchedValue.length === 0)
      )
    case 'isNotEmpty':
      return (
        watchedValue !== null &&
        watchedValue !== undefined &&
        watchedValue !== '' &&
        (!Array.isArray(watchedValue) || watchedValue.length > 0)
      )
    case 'in':
      return Array.isArray(value) && (value as unknown[]).includes(watchedValue)
    case 'notIn':
      return (
        Array.isArray(value) && !(value as unknown[]).includes(watchedValue)
      )
    case 'matches':
      if (typeof watchedValue === 'string' && typeof value === 'string') {
        try {
          const regex = new RegExp(value)
          return regex.test(watchedValue)
        } catch {
          return false
        }
      }
      return false
    default:
      return false
  }
}

function FormConditionalFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  conditions,
  logic = 'and',
  children,
  fallback,
  className,
  animate = true,
}: FormConditionalFieldProps<TFieldValues>) {
  const fieldNames = useMemo(() => conditions.map((c) => c.field), [conditions])

  const watchedValues = useWatch({
    control,
    name: fieldNames as FieldPath<TFieldValues>[],
  })

  const shouldRender = useMemo(() => {
    const results = conditions.map((condition, index) =>
      evaluateCondition(condition, watchedValues[index]),
    )

    if (logic === 'and') {
      return results.every(Boolean)
    }
    return results.some(Boolean)
  }, [conditions, watchedValues, logic])

  if (!shouldRender) {
    return fallback ?? null
  }

  return (
    <div
      className={cn(
        animate && 'animate-in fade-in-0 slide-in-from-top-2 duration-200',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const FormConditionalField = memo(
  FormConditionalFieldComponent,
) as typeof FormConditionalFieldComponent
