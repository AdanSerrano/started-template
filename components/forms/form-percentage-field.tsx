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
import { Slider } from '@/components/ui/slider'
import { Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormPercentageFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  showSlider?: boolean | undefined
  showInput?: boolean | undefined
  decimals?: number | undefined
  displayMode?: 'input' | 'slider' | 'both' | undefined
}

interface PercentageContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  min: number
  max: number
  step: number
  decimals: number
  displayMode: 'input' | 'slider' | 'both'
  sliderMarks: number[]
}

const PercentageContent = memo(function PercentageContent({
  field,
  hasError,
  disabled,
  placeholder,
  min,
  max,
  step,
  decimals,
  displayMode,
  sliderMarks,
}: PercentageContentProps) {
  const currentValue = useMemo(() => field.value ?? 0, [field.value])

  const formattedValue = useMemo(() => {
    if (currentValue === null || currentValue === undefined) return ''
    return currentValue.toFixed(decimals)
  }, [currentValue, decimals])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^0-9.-]/g, '')
      const parsed = parseFloat(cleaned)
      if (isNaN(parsed)) {
        field.onChange(null)
      } else {
        field.onChange(Math.min(max, Math.max(min, parsed)))
      }
    },
    [field, min, max],
  )

  const handleSliderChange = useCallback(
    (values: number[]) => {
      field.onChange(values[0])
    },
    [field],
  )

  const inputClasses = useMemo(
    () => cn('bg-background pr-10', hasError && 'border-destructive'),
    [hasError],
  )

  return (
    <div className="space-y-4">
      {(displayMode === 'input' || displayMode === 'both') && (
        <div className="relative">
          <Input
            type="number"
            value={formattedValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled ?? false}
            min={min}
            max={max}
            step={step}
            className={inputClasses}
          />
          <div className="text-foreground/60 pointer-events-none absolute top-1/2 right-3 z-10 -translate-y-1/2">
            <Percent className="h-4 w-4" />
          </div>
        </div>
      )}

      {(displayMode === 'slider' || displayMode === 'both') && (
        <div className="space-y-2 px-1">
          <Slider
            value={[currentValue]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled ?? false}
            className="w-full"
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            {sliderMarks.map((mark) => (
              <span key={mark}>{mark}%</span>
            ))}
          </div>
        </div>
      )}

      {displayMode === 'slider' && (
        <div className="text-center">
          <span className="text-2xl font-bold">{formattedValue}</span>
          <span className="text-muted-foreground text-lg">%</span>
        </div>
      )}
    </div>
  )
})

function FormPercentageFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '0',
  disabled,
  className,
  required,
  min = 0,
  max = 100,
  step = 1,
  decimals = 0,
  displayMode = 'both',
}: FormPercentageFieldProps<TFieldValues, TName>) {
  const sliderMarks = useMemo(() => {
    const marks: number[] = [min]
    const quarter = (max - min) / 4
    marks.push(min + quarter, min + quarter * 2, min + quarter * 3, max)
    return marks
  }, [min, max])

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
            <PercentageContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              decimals={decimals}
              displayMode={displayMode}
              sliderMarks={sliderMarks}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormPercentageField = memo(
  FormPercentageFieldComponent,
) as typeof FormPercentageFieldComponent
