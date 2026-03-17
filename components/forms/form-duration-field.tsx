'use client'

import { Clock } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
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
import {
  DEFAULT_DURATION_LABELS,
  durationToSeconds,
  formatDuration,
  normalizeDuration,
  type DurationValue,
} from './form-duration-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

export type { DurationValue } from './form-duration-field.utils'

export interface FormDurationFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showHours?: boolean | undefined
  showMinutes?: boolean | undefined
  showSeconds?: boolean | undefined
  maxHours?: number | undefined
  showTotalSeconds?: boolean | undefined
  labels?: {
    hours?: string | undefined
    minutes?: string | undefined
    seconds?: string | undefined
  }
}

const DurationInput = memo(function DurationInput({
  label,
  value,
  max,
  onChange,
  disabled,
  error,
}: {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean | undefined
  error?: boolean | undefined
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (isNaN(newValue)) {
      onChange(0)
    } else {
      onChange(Math.min(max, Math.max(0, newValue)))
    }
  }

  return (
    <div className="min-w-0 flex-1">
      <label className="text-muted-foreground mb-1 block text-xs font-medium">
        {label}
      </label>
      <Input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={handleChange}
        disabled={disabled ?? false}
        className={cn(
          'bg-background text-center font-mono',
          error && 'border-destructive',
        )}
      />
    </div>
  )
})

function FormDurationFieldComponent<
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
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  maxHours = 99,
  showTotalSeconds = false,
  labels: customLabels,
}: FormDurationFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () =>
      ({
        ...DEFAULT_DURATION_LABELS,
        ...customLabels,
      }) as typeof DEFAULT_DURATION_LABELS,
    [customLabels],
  )

  const updateField = useCallback(
    (
      currentValue: DurationValue,
      key: keyof DurationValue,
      newValue: number,
      onChange: (value: DurationValue) => void,
    ) => {
      onChange(normalizeDuration(currentValue, key, newValue, maxHours))
    },
    [maxHours],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value || {
          hours: 0,
          minutes: 0,
          seconds: 0,
        }) as DurationValue
        const hasError = !!fieldState.error
        const totalSeconds = durationToSeconds(value)
        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <Clock className="text-muted-foreground mb-2 h-5 w-5" />
                  <div className="flex flex-1 items-center gap-2">
                    {showHours && (
                      <>
                        <DurationInput
                          label={labels.hours}
                          value={value.hours}
                          max={maxHours}
                          onChange={(v) =>
                            updateField(value, 'hours', v, field.onChange)
                          }
                          disabled={disabled ?? false}
                          error={hasError}
                        />
                        {(showMinutes || showSeconds) && (
                          <span className="text-muted-foreground mb-0 text-xl font-light">
                            :
                          </span>
                        )}
                      </>
                    )}
                    {showMinutes && (
                      <>
                        <DurationInput
                          label={labels.minutes}
                          value={value.minutes}
                          max={59}
                          onChange={(v) =>
                            updateField(value, 'minutes', v, field.onChange)
                          }
                          disabled={disabled ?? false}
                          error={hasError}
                        />
                        {showSeconds && (
                          <span className="text-muted-foreground mb-0 text-xl font-light">
                            :
                          </span>
                        )}
                      </>
                    )}
                    {showSeconds && (
                      <DurationInput
                        label={labels.seconds}
                        value={value.seconds}
                        max={59}
                        onChange={(v) =>
                          updateField(value, 'seconds', v, field.onChange)
                        }
                        disabled={disabled ?? false}
                        error={hasError}
                      />
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>{formatDuration(value)}</span>
                  {showTotalSeconds && (
                    <span>{totalSeconds.toLocaleString()} seconds total</span>
                  )}
                </div>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export const FormDurationField = memo(
  FormDurationFieldComponent,
) as typeof FormDurationFieldComponent
