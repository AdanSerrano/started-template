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
import { ImageCropContent } from './image-crop-content'
import { DEFAULT_LABELS } from './types'
import type { FormImageCropFieldProps } from './types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

function FormImageCropFieldComponent<
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
  aspectRatio = 1,
  maxFileSize = 5 * 1024 * 1024,
  accept = 'image/*',
  outputFormat = 'jpeg',
  outputQuality = 0.9,
  cropShape = 'rect',
  labels: customLabels,
}: FormImageCropFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
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
            <ImageCropContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              aspectRatio={aspectRatio}
              maxFileSize={maxFileSize}
              accept={accept}
              outputFormat={outputFormat}
              outputQuality={outputQuality}
              cropShape={cropShape}
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

export const FormImageCropField = memo(
  FormImageCropFieldComponent,
) as typeof FormImageCropFieldComponent

export type { FormImageCropFieldProps, CropArea } from './types'
