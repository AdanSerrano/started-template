'use client'

import { memo, useMemo } from 'react'
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
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from '@/components/forms/form-field.types'
import { FormFieldTooltip } from '@/components/forms/form-field-tooltip'
import { generateHours, generateMinutes } from './time-utils'
import { TimeRangeContent } from './time-range-content'

export interface FormTimeRangeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  format?: '12h' | '24h' | undefined
  minuteStep?: 1 | 5 | 10 | 15 | 30 | undefined
  labels?:
    | {
        from?: string | undefined
        to?: string | undefined
      }
    | undefined
}

function FormTimeRangeFieldComponent<
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
  tooltip,
  format = '12h',
  minuteStep = 15,
  labels,
}: FormTimeRangeFieldProps<TFieldValues, TName>) {
  const hours = useMemo(() => generateHours(format), [format])
  const minutes = useMemo(() => generateMinutes(minuteStep), [minuteStep])

  const mergedLabels = useMemo(
    () =>
      ({
        from: 'From',
        to: 'To',
        ...labels,
      }) as { from: string; to: string },
    [labels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <FormControl>
            <TimeRangeContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              format={format}
              hours={hours}
              minutes={minutes}
              mergedLabels={mergedLabels}
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

export const FormTimeRangeField = memo(
  FormTimeRangeFieldComponent,
) as typeof FormTimeRangeFieldComponent
