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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, X, Upload, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormAvatarFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined
  fallback?: string | undefined
  fallbackIcon?: React.ReactNode | undefined
  maxFileSize?: number | undefined
  accept?: string | undefined
  showRemoveButton?: boolean | undefined
  labels?: {
    upload?: string | undefined
    change?: string | undefined
    remove?: string | undefined
  }
}

const SIZE_MAP = {
  sm: { avatar: 'h-16 w-16', button: 'h-6 w-6', icon: 'h-3 w-3' },
  md: { avatar: 'h-24 w-24', button: 'h-8 w-8', icon: 'h-4 w-4' },
  lg: { avatar: 'h-32 w-32', button: 'h-9 w-9', icon: 'h-4 w-4' },
  xl: { avatar: 'h-40 w-40', button: 'h-10 w-10', icon: 'h-5 w-5' },
}

const DEFAULT_LABELS = {
  upload: 'Upload photo',
  change: 'Change photo',
  remove: 'Remove',
}

interface AvatarContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  size: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string | undefined
  fallbackIcon?: React.ReactNode | undefined
  maxFileSize: number
  accept: string
  showRemoveButton: boolean
  labels: typeof DEFAULT_LABELS
}

const AvatarContent = memo(function AvatarContent({
  field,
  hasError,
  disabled,
  size,
  fallback,
  fallbackIcon,
  maxFileSize,
  accept,
  showRemoveButton,
  labels,
}: AvatarContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sizeConfig = SIZE_MAP[size]

  const processImage = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (file.size > maxFileSize) {
          reject(new Error('File too large'))
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const canvasSize = 256
            canvas.width = canvasSize
            canvas.height = canvasSize

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              resolve(e.target?.result as string)
              return
            }

            const minDim = Math.min(img.width, img.height)
            const sx = (img.width - minDim) / 2
            const sy = (img.height - minDim) / 2

            ctx.beginPath()
            ctx.arc(
              canvasSize / 2,
              canvasSize / 2,
              canvasSize / 2,
              0,
              Math.PI * 2,
            )
            ctx.closePath()
            ctx.clip()

            ctx.drawImage(
              img,
              sx,
              sy,
              minDim,
              minDim,
              0,
              0,
              canvasSize,
              canvasSize,
            )

            resolve(canvas.toDataURL('image/jpeg', 0.9))
          }
          img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    },
    [maxFileSize],
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const result = await processImage(file)
        field.onChange(result)
      } catch (error) {
        console.error('Error processing image:', error)
      }

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [field, processImage],
  )

  const handleRemove = useCallback(() => {
    field.onChange('')
  }, [field])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getFallbackContent = useCallback(() => {
    if (fallbackIcon) return fallbackIcon
    if (fallback) {
      return fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return <User className={sizeConfig.icon} />
  }, [fallback, fallbackIcon, sizeConfig.icon])

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
      <div className="relative">
        <Avatar
          className={cn(
            sizeConfig.avatar,
            'border-2',
            hasError ? 'border-destructive' : 'border-muted',
          )}
        >
          <AvatarImage src={field.value || undefined} alt="Avatar" />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {getFallbackContent()}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn(
            sizeConfig.button,
            'absolute -right-1 -bottom-1 rounded-full shadow-md',
          )}
          onClick={handleClick}
          disabled={disabled ?? false}
        >
          <Camera className={sizeConfig.icon} />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled ?? false}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled ?? false}
        >
          <Upload className="mr-2 h-4 w-4" />
          {field.value ? labels.change : labels.upload}
        </Button>
        {field.value && showRemoveButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled ?? false}
            className="text-destructive hover:text-destructive"
          >
            <X className="mr-2 h-4 w-4" />
            {labels.remove}
          </Button>
        )}
      </div>
    </div>
  )
})

function FormAvatarFieldComponent<
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
  size = 'lg',
  fallback,
  fallbackIcon,
  maxFileSize = 2 * 1024 * 1024,
  accept = 'image/*',
  showRemoveButton = true,
  labels: customLabels,
}: FormAvatarFieldProps<TFieldValues, TName>) {
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
            <AvatarContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              size={size}
              fallback={fallback}
              fallbackIcon={fallbackIcon}
              maxFileSize={maxFileSize}
              accept={accept}
              showRemoveButton={showRemoveButton}
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

export const FormAvatarField = memo(
  FormAvatarFieldComponent,
) as typeof FormAvatarFieldComponent
