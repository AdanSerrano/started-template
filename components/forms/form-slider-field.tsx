'use client'

import { memo, useMemo, useCallback } from 'react'
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
import { Slider } from '@/components/ui/slider'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormSliderFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  showValue?: boolean | undefined
  formatValue?: ((value: number) => string) | undefined
  showMinMax?: boolean | undefined
  sliderClassName?: string | undefined
}

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

const SliderContent = memo(function SliderContent({
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

function FormSliderFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue,
  showMinMax = false,
  sliderClassName,
}: FormSliderFieldProps<TFieldValues, TName>) {
  const format = useMemo(
    () => formatValue ?? ((v: number) => String(v)),
    [formatValue],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between">
            {label && <FormLabel>{label}</FormLabel>}
            {showValue && (
              <span className="text-sm font-medium tabular-nums">
                {format(field.value ?? min)}
              </span>
            )}
          </div>
          <FormControl>
            <SliderContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              disabled={disabled ?? false}
              min={min}
              max={max}
              step={step}
              showMinMax={showMinMax}
              sliderClassName={sliderClassName}
              format={format}
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

export const FormSliderField = memo(
  FormSliderFieldComponent,
) as typeof FormSliderFieldComponent

export interface FormRangeSliderFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  showValues?: boolean | undefined
  formatValue?: ((value: number) => string) | undefined
  showMinMax?: boolean | undefined
  sliderClassName?: string | undefined
}

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

const RangeSliderContent = memo(function RangeSliderContent({
  field,
  disabled,
  min,
  max,
  step,
  showMinMax,
  sliderClassName,
  format,
}: RangeSliderContentProps) {
  const values: [number, number] = useMemo(
    () => field.value ?? [min, max],
    [field.value, min, max],
  )

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

function FormRangeSliderFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  min = 0,
  max = 100,
  step = 1,
  showValues = true,
  formatValue,
  showMinMax = false,
  sliderClassName,
}: FormRangeSliderFieldProps<TFieldValues, TName>) {
  const format = useMemo(
    () => formatValue ?? ((v: number) => String(v)),
    [formatValue],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values: [number, number] = field.value ?? [min, max]

        return (
          <FormItem className={className}>
            <div className="flex items-center justify-between">
              {label && <FormLabel>{label}</FormLabel>}
              {showValues && (
                <span className="text-sm font-medium tabular-nums">
                  {format(values[0])} - {format(values[1])}
                </span>
              )}
            </div>
            <FormControl>
              <RangeSliderContent
                field={
                  field as unknown as ControllerRenderProps<FieldValues, string>
                }
                disabled={disabled ?? false}
                min={min}
                max={max}
                step={step}
                showMinMax={showMinMax}
                sliderClassName={sliderClassName}
                format={format}
              />
            </FormControl>
            {description && (
              <FormDescription className="text-xs">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export const FormRangeSliderField = memo(
  FormRangeSliderFieldComponent,
) as typeof FormRangeSliderFieldComponent
