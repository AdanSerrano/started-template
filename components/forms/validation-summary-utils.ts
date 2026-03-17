import type { FieldErrors } from 'react-hook-form'

export interface FlatError {
  field: string
  message: string
}

export function flattenErrors(errors: FieldErrors, prefix = ''): FlatError[] {
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

export const DEFAULT_VALIDATION_LABELS = {
  title: 'Please fix the following errors:',
  singleError: 'error',
  multipleErrors: 'errors',
  showMore: 'Show all',
  showLess: 'Show less',
}
