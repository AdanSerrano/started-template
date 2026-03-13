'use client'

import { memo, useCallback, useMemo, useRef } from 'react'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface MaskDefinition {
  pattern: string
  placeholder?: string | undefined
  definitions?: Record<string, RegExp> | undefined
}

export type PresetMask =
  | 'phone-us'
  | 'phone-mx'
  | 'ssn'
  | 'zip-us'
  | 'zip-mx'
  | 'credit-card'
  | 'date'
  | 'time'
  | 'percentage'
  | 'currency'

const PRESET_MASKS: Record<PresetMask, MaskDefinition> = {
  'phone-us': { pattern: '(999) 999-9999', placeholder: '(___) ___-____' },
  'phone-mx': { pattern: '+52 99 9999 9999', placeholder: '+52 __ ____ ____' },
  ssn: { pattern: '999-99-9999', placeholder: '___-__-____' },
  'zip-us': { pattern: '99999', placeholder: '_____' },
  'zip-mx': { pattern: '99999', placeholder: '_____' },
  'credit-card': {
    pattern: '9999 9999 9999 9999',
    placeholder: '____ ____ ____ ____',
  },
  date: { pattern: '99/99/9999', placeholder: '__/__/____' },
  time: { pattern: '99:99', placeholder: '__:__' },
  percentage: {
    pattern: '999%',
    placeholder: '___%',
    definitions: { 9: /[0-9]/ },
  },
  currency: { pattern: '$9,999,999.99', placeholder: '$_,___,___.___' },
}

const DEFAULT_DEFINITIONS: Record<string, RegExp> = {
  '9': /[0-9]/,
  a: /[a-zA-Z]/,
  A: /[A-Z]/,
  '*': /[a-zA-Z0-9]/,
}

export interface FormMaskFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  mask?: string | MaskDefinition | undefined
  preset?: PresetMask | undefined
  showMask?: boolean | undefined
  maskChar?: string | undefined
  alwaysShowMask?: boolean | undefined
  leftIcon?: React.ReactNode | undefined
  rightIcon?: React.ReactNode | undefined
}

function applyMask(
  value: string,
  pattern: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''
  let valueIndex = 0

  for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition) {
      while (valueIndex < value.length) {
        const inputChar = value[valueIndex]!
        valueIndex++

        if (definition.test(inputChar)) {
          result += inputChar
          break
        }
      }
    } else {
      result += patternChar
      if (value[valueIndex] === patternChar) {
        valueIndex++
      }
    }
  }

  return result
}

function getRawValue(
  value: string,
  pattern: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''

  for (let i = 0; i < value.length && i < pattern.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition && definition.test(value[i]!)) {
      result += value[i]
    }
  }

  return result
}

function getMaskedPlaceholder(
  pattern: string,
  maskChar: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''

  for (let i = 0; i < pattern.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition) {
      result += maskChar
    } else {
      result += patternChar
    }
  }

  return result
}

interface MaskContentProps {
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

const MaskContent = memo(function MaskContent({
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

function FormMaskFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  required,
  mask,
  preset,
  showMask = true,
  maskChar = '_',
  alwaysShowMask = false,
  leftIcon,
  rightIcon,
}: FormMaskFieldProps<TFieldValues, TName>) {
  const maskDefinition = useMemo((): MaskDefinition => {
    if (preset) {
      return PRESET_MASKS[preset]
    }
    if (typeof mask === 'string') {
      return { pattern: mask }
    }
    return mask || { pattern: '' }
  }, [mask, preset])

  const definitions = useMemo(
    () =>
      ({
        ...DEFAULT_DEFINITIONS,
        ...maskDefinition.definitions,
      }) as typeof DEFAULT_DEFINITIONS,
    [maskDefinition.definitions],
  )

  const pattern = maskDefinition.pattern

  const displayPlaceholder = useMemo(
    () =>
      placeholder ||
      maskDefinition.placeholder ||
      getMaskedPlaceholder(pattern, maskChar, definitions),
    [placeholder, maskDefinition.placeholder, pattern, maskChar, definitions],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <MaskContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={displayPlaceholder}
              pattern={pattern}
              definitions={definitions}
              showMask={showMask}
              maskChar={maskChar}
              alwaysShowMask={alwaysShowMask}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormMaskField = memo(
  FormMaskFieldComponent,
) as typeof FormMaskFieldComponent
