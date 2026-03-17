import { useCallback, useRef, useMemo } from 'react'
import type { FileWithPreview } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface UseFileUploadOptions {
  field: ControllerRenderProps<FieldValues, string>
  multiple: boolean
  maxSize?: number | undefined
  maxFiles: number
  onFilesChange?: ((files: File[]) => void) | undefined
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function useFileUpload({
  field,
  multiple,
  maxSize,
  maxFiles,
  onFilesChange,
}: UseFileUploadOptions) {
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

  return {
    inputRef,
    files,
    handleRemove,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleClick,
    handleInputChange,
  }
}
