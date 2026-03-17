'use client'

import { memo, useCallback } from 'react'

export interface ValidationErrorItemProps {
  field: string
  message: string
  fieldLabel: string
  onClick: (field: string) => void
}

export const ValidationErrorItem = memo(function ValidationErrorItem({
  field,
  message,
  fieldLabel,
  onClick,
}: ValidationErrorItemProps) {
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
