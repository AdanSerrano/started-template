'use client'

import { memo, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface SliderContentProps {
  field: ControllerRenderProps<FieldValues, string>
  disabled?: boolean | undefined
  min: number
  max: number
  step: number
  showMinMax: boolean
  sliderClassName?: string | undefined
  format: (v: number) => string
}

export const SliderContent = memo(function SliderContent({
  field,
  disabled,
  min,
  max,
  step,
  showMinMax,
  sliderClassName,
  format,
}: SliderContentProps) {
  const handleValueChange = useCallback(
    ([value]: number[]) => {
      field.onChange(value)
    },
    [field],
  )

  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        step={step}
        disabled={disabled ?? false}
        value={[field.value ?? min]}
        onValueChange={handleValueChange}
        className={sliderClassName}
      />
      {showMinMax && (
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  )
})

interface RangeSliderContentProps {
  field: ControllerRenderProps<FieldValues, string>
  disabled?: boolean | undefined
  min: number
  max: number
  step: number
  showMinMax: boolean
  sliderClassName?: string | undefined
  format: (v: number) => string
}

export const RangeSliderContent = memo(function RangeSliderContent({
  field,
  disabled,
  min,
  max,
  step,
  showMinMax,
  sliderClassName,
  format,
}: RangeSliderContentProps) {
  const values: [number, number] = field.value ?? [min, max]

  const handleValueChange = useCallback(
    (newValues: number[]) => {
      field.onChange(newValues as [number, number])
    },
    [field],
  )

  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        step={step}
        disabled={disabled ?? false}
        value={values}
        onValueChange={handleValueChange}
        className={sliderClassName}
      />
      {showMinMax && (
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  )
})
