'use client'

import { Upload, X } from 'lucide-react'
import NextImage from 'next/image'
import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CropPreviewProps {
  value: string
  aspectRatio: number
  cropShape: 'rect' | 'round'
  disabled?: boolean | undefined
  onRemove: () => void
}

export const CropPreview = memo(function CropPreview({
  value,
  aspectRatio,
  cropShape,
  disabled,
  onRemove,
}: CropPreviewProps) {
  const previewStyle = useMemo(
    () => ({
      width: aspectRatio >= 1 ? 150 : 150 * aspectRatio,
      height: aspectRatio >= 1 ? 150 / aspectRatio : 150,
    }),
    [aspectRatio],
  )

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'border-muted-foreground/25 overflow-hidden border-2 border-dashed',
          cropShape === 'round' ? 'rounded-full' : 'rounded-lg',
        )}
        style={previewStyle}
      >
        <NextImage
          src={value}
          alt="Preview"
          width={150}
          height={150}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
        disabled={disabled ?? false}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
})

export interface UploadButtonProps {
  hasError: boolean
  disabled?: boolean | undefined
  label: string
  onClick: () => void
}

export const UploadButton = memo(function UploadButton({
  hasError,
  disabled,
  label,
  onClick,
}: UploadButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled ?? false}
      className={cn(
        'h-auto flex-col gap-2 p-6',
        hasError && 'border-destructive',
      )}
    >
      <Upload className="text-muted-foreground h-8 w-8" />
      <span>{label}</span>
    </Button>
  )
})
