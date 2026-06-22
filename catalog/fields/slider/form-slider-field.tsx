'use client'

import { memo, useMemo } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SliderContent, RangeSliderContent } from './slider-marks'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

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
