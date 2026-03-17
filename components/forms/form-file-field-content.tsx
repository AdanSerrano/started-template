'use client'

import { Upload, X, File, Image, FileText, FileArchive } from 'lucide-react'
import NextImage from 'next/image'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatFileSize, useFileUpload } from './use-file-upload'
import type { FileWithPreview } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

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

export interface FileContentProps {
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

export const FileContent = memo(function FileContent({
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
  const {
    inputRef,
    files,
    handleRemove,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleClick,
    handleInputChange,
  } = useFileUpload({ field, multiple, maxSize, maxFiles, onFilesChange })

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
