import { useMemo, useCallback, useRef, useState } from 'react'
import { calculatePasswordStrength } from './form-field.types'

export const STRENGTH_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
]

export const STRENGTH_WIDTHS = [
  'w-0',
  'w-1/5',
  'w-2/5',
  'w-3/5',
  'w-4/5',
  'w-full',
]

export function usePasswordCopy(
  value: string | undefined,
  onCopied?: () => void,
) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleCopy = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
      onCopied?.()
    } catch {
      // Clipboard API not available
    }
  }, [value, onCopied])

  return { copied, handleCopy }
}

export function usePasswordStrength(value: string) {
  return useMemo(() => calculatePasswordStrength(value), [value])
}
