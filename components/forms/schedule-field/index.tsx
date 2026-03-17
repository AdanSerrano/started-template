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
import { ScheduleContent } from './schedule-content'
import { DEFAULT_LABELS } from './types'
import type { FormScheduleFieldProps } from './types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

function FormScheduleFieldComponent<
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
  allowMultipleSlots = true,
  maxSlotsPerDay = 3,
  showCopyButton = true,
  labels: customLabels,
}: FormScheduleFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () =>
      ({
        days: { ...DEFAULT_LABELS.days, ...customLabels?.days },
        addSlot: customLabels?.addSlot ?? DEFAULT_LABELS.addSlot,
        copyToAll: customLabels?.copyToAll ?? DEFAULT_LABELS.copyToAll,
      }) as typeof DEFAULT_LABELS,
    [customLabels],
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
            <ScheduleContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              allowMultipleSlots={allowMultipleSlots}
              maxSlotsPerDay={maxSlotsPerDay}
              showCopyButton={showCopyButton}
              labels={labels}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormScheduleField = memo(
  FormScheduleFieldComponent,
) as typeof FormScheduleFieldComponent

export type {
  FormScheduleFieldProps,
  DayOfWeek,
  TimeSlot,
  DaySchedule,
  WeekSchedule,
} from './types'
