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
import { CoordinatesContent } from './coordinates-field-content'
import { DEFAULT_COORDINATE_LABELS } from './form-coordinates-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { CoordinatesValue } from './form-coordinates-field.utils'

export interface FormCoordinatesFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showGetLocation?: boolean | undefined
  showOpenMap?: boolean | undefined
  showCopy?: boolean | undefined
  precision?: number | undefined
  mapProvider?: 'google' | 'openstreetmap' | undefined
  labels?: {
    latitude?: string | undefined
    longitude?: string | undefined
    getLocation?: string | undefined
    openMap?: string | undefined
    copy?: string | undefined
  }
}

function FormCoordinatesFieldComponent<
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
  showGetLocation = true,
  showOpenMap = true,
  showCopy = true,
  precision = 6,
  mapProvider = 'google',
  labels: customLabels,
}: FormCoordinatesFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () =>
      ({
        ...DEFAULT_COORDINATE_LABELS,
        ...customLabels,
      }) as typeof DEFAULT_COORDINATE_LABELS,
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
            <CoordinatesContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              showGetLocation={showGetLocation}
              showOpenMap={showOpenMap}
              showCopy={showCopy}
              precision={precision}
              mapProvider={mapProvider}
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

export const FormCoordinatesField = memo(
  FormCoordinatesFieldComponent,
) as typeof FormCoordinatesFieldComponent
