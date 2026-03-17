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
import { FileContent } from './form-file-field-content'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormFileFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  accept?: string | undefined
  multiple?: boolean | undefined
  maxSize?: number | undefined
  maxFiles?: number | undefined
  showPreview?: boolean | undefined
  labels?:
    | {
        upload?: string | undefined
        dragDrop?: string | undefined
        remove?: string | undefined
        maxSizeError?: string | undefined
        maxFilesError?: string | undefined
      }
    | undefined
  onFilesChange?: ((files: File[]) => void) | undefined
  dropzoneClassName?: string | undefined
}

function FormFileFieldComponent<
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
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  showPreview = true,
  labels,
  onFilesChange,
  dropzoneClassName,
}: FormFileFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () =>
      ({
        upload: 'Click to upload or drag and drop',
        dragDrop: 'Drop files here',
        remove: 'Remove',
        maxSizeError: 'File too large',
        maxFilesError: 'Too many files',
        ...labels,
      }) as {
        upload: string
        dragDrop: string
        remove: string
        maxSizeError: string
        maxFilesError: string
      },
    [labels],
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
            <FileContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              accept={accept}
              multiple={multiple}
              maxSize={maxSize}
              maxFiles={maxFiles}
              showPreview={showPreview}
              labels={mergedLabels}
              onFilesChange={onFilesChange}
              dropzoneClassName={dropzoneClassName}
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

export const FormFileField = memo(
  FormFileFieldComponent,
) as typeof FormFileFieldComponent
