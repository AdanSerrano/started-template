'use client'

import { memo, useCallback, useMemo, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  applyMask,
  getRawValue,
  getMaskedPlaceholder,
} from './form-mask-field.utils'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface MaskContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  pattern: string
  definitions: Record<string, RegExp>
  showMask: boolean
  maskChar: string
  alwaysShowMask: boolean
  leftIcon?: React.ReactNode | undefined
  rightIcon?: React.ReactNode | undefined
}

export const MaskContent = memo(function MaskContent({
  field,
  hasError,
  disabled,
  placeholder,
  pattern,
  definitions,
  showMask,
  maskChar,
  alwaysShowMask,
  leftIcon,
  rightIcon,
}: MaskContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = useMemo(() => {
    const value = field.value || ''
    if (!showMask || (!alwaysShowMask && !value)) {
      return value
    }

    const masked = applyMask(value, pattern, definitions)
    const placeholderMask = getMaskedPlaceholder(pattern, maskChar, definitions)

    let display = ''
    for (let i = 0; i < pattern.length; i++) {
      if (i < masked.length) {
        display += masked[i]
      } else if (alwaysShowMask) {
        display += placeholderMask[i] || ''
      }
    }

    return display || masked
  }, [field.value, showMask, alwaysShowMask, pattern, definitions, maskChar])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const rawInput = inputValue.replace(/[^a-zA-Z0-9]/g, '')
      const maskedValue = applyMask(rawInput, pattern, definitions)
      field.onChange(maskedValue)
    },
    [field, pattern, definitions],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const input = inputRef.current
        if (!input) return

        const selStart = input.selectionStart ?? 0
        const currentValue = field.value || ''

        if (selStart > 0 && selStart <= currentValue.length) {
          let deleteIndex = selStart - 1

          while (deleteIndex >= 0) {
            const patternChar = pattern[deleteIndex]!
            if (definitions[patternChar]) {
              break
            }
            deleteIndex--
          }

          if (deleteIndex >= 0) {
            const newValue =
              currentValue.slice(0, deleteIndex) + currentValue.slice(selStart)
            const remasked = applyMask(
              getRawValue(newValue, pattern, definitions),
              pattern,
              definitions,
            )
            field.onChange(remasked)

            e.preventDefault()
            requestAnimationFrame(() => {
              input.setSelectionRange(deleteIndex, deleteIndex)
            })
          }
        }
      }
    },
    [field, pattern, definitions],
  )

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background font-mono',
        leftIcon && 'pl-10',
        rightIcon && 'pr-10',
        hasError && 'border-destructive',
      ),
    [leftIcon, rightIcon, hasError],
  )

  return (
    <div className="relative">
      {leftIcon && (
        <div className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
          {leftIcon}
        </div>
      )}
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled ?? false}
        className={inputClasses}
      />
      {rightIcon && (
        <div className="text-foreground/60 pointer-events-none absolute top-1/2 right-3 z-10 -translate-y-1/2">
          {rightIcon}
        </div>
      )}
    </div>
  )
})
