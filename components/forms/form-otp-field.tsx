'use client'

import { memo, useCallback, useMemo } from 'react'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'

export interface FormOTPFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  length?: 4 | 6 | 8 | undefined
  pattern?: 'digits' | 'alphanumeric' | undefined
  showSeparator?: boolean | undefined
  separatorAfter?: number | undefined
  autoSubmit?: boolean | undefined
  onComplete?: ((value: string) => void) | undefined
  inputClassName?: string | undefined
}

interface OTPContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  length: number
  patternRegex: string
  showSeparator: boolean
  separatorPosition: number
  autoSubmit: boolean
  onComplete?: ((value: string) => void) | undefined
  inputClassName?: string | undefined
}

const OTPContent = memo(function OTPContent({
  field,
  hasError,
  disabled,
  length,
  patternRegex,
  showSeparator,
  separatorPosition,
  autoSubmit,
  onComplete,
  inputClassName,
}: OTPContentProps) {
  const handleComplete = useCallback(
    (value: string) => {
      if (autoSubmit && onComplete) {
        onComplete(value)
      }
    },
    [autoSubmit, onComplete],
  )

  const containerClasses = useMemo(
    () =>
      cn(
        'justify-center',
        hasError && '[&_[data-slot=input-otp-slot]]:border-destructive',
      ),
    [hasError],
  )

  const firstGroupSlots = useMemo(
    () => Array.from({ length: separatorPosition }, (_, i) => i),
    [separatorPosition],
  )

  const secondGroupSlots = useMemo(
    () =>
      Array.from(
        { length: length - separatorPosition },
        (_, i) => separatorPosition + i,
      ),
    [length, separatorPosition],
  )

  const allSlots = useMemo(() => Array.from({ length }, (_, i) => i), [length])

  return (
    <InputOTP
      maxLength={length}
      pattern={patternRegex}
      disabled={disabled ?? false}
      value={field.value ?? ''}
      onChange={field.onChange}
      onComplete={handleComplete}
      containerClassName={containerClasses}
      className={inputClassName}
    >
      {showSeparator ? (
        <>
          <InputOTPGroup>
            {firstGroupSlots.map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {secondGroupSlots.map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </>
      ) : (
        <InputOTPGroup>
          {allSlots.map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      )}
    </InputOTP>
  )
})

function FormOTPFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  required,
  length = 6,
  pattern = 'digits',
  showSeparator = false,
  separatorAfter,
  autoSubmit = false,
  onComplete,
  inputClassName,
}: FormOTPFieldProps<TFieldValues, TName>) {
  const separatorPosition = useMemo(
    () => separatorAfter ?? Math.floor(length / 2),
    [separatorAfter, length],
  )

  const patternRegex = useMemo(
    () =>
      pattern === 'digits' ? REGEXP_ONLY_DIGITS : REGEXP_ONLY_DIGITS_AND_CHARS,
    [pattern],
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
            <OTPContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              length={length}
              patternRegex={patternRegex}
              showSeparator={showSeparator}
              separatorPosition={separatorPosition}
              autoSubmit={autoSubmit}
              onComplete={onComplete}
              inputClassName={inputClassName}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-center text-xs">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-center" />
        </FormItem>
      )}
    />
  )
}

export const FormOTPField = memo(
  FormOTPFieldComponent,
) as typeof FormOTPFieldComponent
