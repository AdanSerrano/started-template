'use client'

import { memo, useMemo } from 'react'
import { FormFieldTooltip } from '@/components/forms/form-field-tooltip'
import type {
  BaseFormFieldProps,
  TimeValue,
} from '@/components/forms/form-field.types'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { TimeContent } from './time-content'
import { generateHours, generateMinutes } from './time-utils'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormTimeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  format?: '12h' | '24h' | undefined
  minuteStep?: 1 | 5 | 10 | 15 | 30 | undefined
  minTime?: TimeValue | undefined
  maxTime?: TimeValue | undefined
  triggerClassName?: string | undefined
}

function FormTimeFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Select time',
  disabled,
  className,
  required,
  tooltip,
  format = '12h',
  minuteStep = 15,
  minTime,
  maxTime,
  triggerClassName,
}: FormTimeFieldProps<TFieldValues, TName>) {
  const hours = useMemo(() => generateHours(format), [format])
  const minutes = useMemo(() => generateMinutes(minuteStep), [minuteStep])

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
          <TimeContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            placeholder={placeholder}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
            format={format}
            hours={hours}
            minutes={minutes}
            minTime={minTime}
            maxTime={maxTime}
          />
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormTimeField = memo(
  FormTimeFieldComponent,
) as typeof FormTimeFieldComponent
