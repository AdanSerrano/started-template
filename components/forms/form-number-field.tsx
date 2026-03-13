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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  showControls?: boolean | undefined
  controlsPosition?: 'sides' | 'right' | undefined
  allowDecimal?: boolean | undefined
  decimalPlaces?: number | undefined
  prefix?: string | undefined
  suffix?: string | undefined
  inputClassName?: string | undefined
}

interface NumberContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  placeholder?: string | undefined
  disabled?: boolean | undefined
  min?: number | undefined
  max?: number | undefined
  step: number
  showControls: boolean
  controlsPosition: 'sides' | 'right'
  allowDecimal: boolean
  decimalPlaces: number
  prefix?: string | undefined
  suffix?: string | undefined
  inputClassName?: string | undefined
}

const NumberContent = memo(function NumberContent({
  field,
  hasError,
  placeholder,
  disabled,
  min,
  max,
  step,
  showControls,
  controlsPosition,
  allowDecimal,
  decimalPlaces,
  prefix,
  suffix,
  inputClassName,
}: NumberContentProps) {
  const currentValue = typeof field.value === 'number' ? field.value : 0
  const displayValue =
    field.value === '' || field.value === '-'
      ? field.value
      : (field.value ?? '')

  const handleIncrement = useCallback(() => {
    const newValue = currentValue + step
    if (max !== undefined && newValue > max) return
    field.onChange(
      allowDecimal ? parseFloat(newValue.toFixed(decimalPlaces)) : newValue,
    )
  }, [currentValue, field, step, max, allowDecimal, decimalPlaces])

  const handleDecrement = useCallback(() => {
    const newValue = currentValue - step
    if (min !== undefined && newValue < min) return
    field.onChange(
      allowDecimal ? parseFloat(newValue.toFixed(decimalPlaces)) : newValue,
    )
  }, [currentValue, field, step, min, allowDecimal, decimalPlaces])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === '' || value === '-') {
        field.onChange(value)
        return
      }

      const parsed = allowDecimal ? parseFloat(value) : parseInt(value, 10)

      if (isNaN(parsed)) return
      if (max !== undefined && parsed > max) return

      field.onChange(
        allowDecimal ? parseFloat(parsed.toFixed(decimalPlaces)) : parsed,
      )
    },
    [field, max, allowDecimal, decimalPlaces],
  )

  const handleBlur = useCallback(() => {
    field.onBlur()
    if (typeof field.value !== 'number') {
      field.onChange(min !== undefined ? min : 0)
    }
  }, [field, min])

  const canDecrement = min === undefined || currentValue > min
  const canIncrement = max === undefined || currentValue < max

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background',
        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        prefix && 'pl-8',
        suffix && 'pr-8',
        showControls && controlsPosition === 'right' && 'pr-20',
        hasError && 'border-destructive',
        inputClassName,
      ),
    [prefix, suffix, showControls, controlsPosition, hasError, inputClassName],
  )

  return (
    <div
      className={cn(
        'flex items-center',
        controlsPosition === 'sides' && 'gap-2',
      )}
    >
      {showControls && controlsPosition === 'sides' && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || !canDecrement}
          onClick={handleDecrement}
          className="h-9 w-9 shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}

      <div className="relative flex-1">
        {prefix && (
          <span className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          placeholder={placeholder}
          disabled={disabled ?? false}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses}
        />
        {suffix && !showControls && (
          <span className="text-foreground/60 pointer-events-none absolute top-1/2 right-3 z-10 -translate-y-1/2 text-sm">
            {suffix}
          </span>
        )}

        {showControls && controlsPosition === 'right' && (
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || !canDecrement}
              onClick={handleDecrement}
              className="h-7 w-7"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || !canIncrement}
              onClick={handleIncrement}
              className="h-7 w-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {showControls && controlsPosition === 'sides' && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || !canIncrement}
          onClick={handleIncrement}
          className="h-9 w-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
})

function FormNumberFieldComponent<
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
  min,
  max,
  step = 1,
  showControls = false,
  controlsPosition = 'right',
  allowDecimal = false,
  decimalPlaces = 2,
  prefix,
  suffix,
  inputClassName,
}: FormNumberFieldProps<TFieldValues, TName>) {
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
            <NumberContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              min={min}
              max={max}
              step={step}
              showControls={showControls}
              controlsPosition={controlsPosition}
              allowDecimal={allowDecimal}
              decimalPlaces={decimalPlaces}
              prefix={prefix}
              suffix={suffix}
              inputClassName={inputClassName}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormNumberField = memo(
  FormNumberFieldComponent,
) as typeof FormNumberFieldComponent
