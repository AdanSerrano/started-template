'use client'

import { memo, useCallback, useRef, useMemo } from 'react'
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
import { Button } from '@/components/ui/button'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import { Upload, X, File, Image, FileText, FileArchive } from 'lucide-react'
import type { BaseFormFieldProps, FileWithPreview } from './form-field.types'

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

const FileTypeIcon = memo(function FileTypeIcon({
  type,
  className,
}: {
  type: string
  className: string
}) {
  const category = type.split('/')[0]
  switch (category) {
    case 'image':
      return <Image className={className} />
    case 'text':
      return <FileText className={className} />
    case 'application':
      return <FileArchive className={className} />
    default:
      return <File className={className} />
  }
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface FilePreviewItemProps {
  file: FileWithPreview
  index: number
  onRemove: (index: number) => void
}

const FilePreviewItem = memo(function FilePreviewItem({
  file,
  index,
  onRemove,
}: FilePreviewItemProps) {
  const iconClassName = 'h-10 w-10 text-muted-foreground p-2 rounded bg-muted'

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [index, onRemove])

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {file.preview ? (
        <NextImage
          src={file.preview}
          alt={file.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded object-cover"
          unoptimized
        />
      ) : (
        <FileTypeIcon type={file.type} className={iconClassName} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(file.size)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        className="h-8 w-8 shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
})

interface FileContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  accept?: string | undefined
  multiple: boolean
  maxSize?: number | undefined
  maxFiles: number
  showPreview: boolean
  labels: {
    upload: string
    dragDrop: string
    remove: string
    maxSizeError: string
    maxFilesError: string
  }
  onFilesChange?: ((files: File[]) => void) | undefined
  dropzoneClassName?: string | undefined
}

const FileContent = memo(function FileContent({
  field,
  hasError,
  disabled,
  accept,
  multiple,
  maxSize,
  maxFiles,
  showPreview,
  labels,
  onFilesChange,
  dropzoneClassName,
}: FileContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const files: FileWithPreview[] = useMemo(
    () => field.value ?? [],
    [field.value],
  )

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return

      const validFiles: FileWithPreview[] = []
      const currentCount = files.length

      Array.from(newFiles).forEach((file) => {
        if (maxSize && file.size > maxSize) return
        if (!multiple && validFiles.length >= 1) return
        if (multiple && currentCount + validFiles.length >= maxFiles) return

        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        })
        validFiles.push(fileWithPreview)
      })

      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles

      field.onChange(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, field, multiple, maxSize, maxFiles, onFilesChange],
  )

  const handleRemove = useCallback(
    (index: number) => {
      const file = files[index]!
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
      const updatedFiles = files.filter((_, i) => i !== index)
      field.onChange(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, field, onFilesChange],
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const dropzoneClasses = useMemo(
    () =>
      cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
        'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        disabled && 'pointer-events-none opacity-50',
        hasError && 'border-destructive',
        dropzoneClassName,
      ),
    [disabled, hasError, dropzoneClassName],
  )

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={dropzoneClasses}
      >
        <Upload className="text-muted-foreground mb-2 h-10 w-10" />
        <p className="text-muted-foreground text-center text-sm">
          {labels.upload}
        </p>
        {maxSize && (
          <p className="text-muted-foreground mt-1 text-xs">
            Max: {formatFileSize(maxSize)}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled ?? false}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {showPreview && files.length > 0 && (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <FilePreviewItem
              key={`${file.name}-${index}`}
              file={file}
              index={index}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
})

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
