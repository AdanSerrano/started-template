'use client'

import { Upload, X } from 'lucide-react'
import NextImage from 'next/image'
import {
  memo,
  useCallback,
  useRef,
  useMemo,
  useState,
  useTransition,
} from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CropDialog } from './crop-dialog'
import type { ImageState, ImageCropContentProps } from './types'

export const ImageCropContent = memo(function ImageCropContent({
  field,
  hasError,
  disabled,
  aspectRatio,
  maxFileSize,
  accept,
  outputFormat,
  outputQuality,
  cropShape,
  labels,
}: ImageCropContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imageState, setImageState] = useState<ImageState | null>(null)
  const imageStateRef = useRef<ImageState | null>(null)

  const [isPending, startTransition] = useTransition()

  const processImage = useCallback(
    async (state: ImageState): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const size = 500
          const width = aspectRatio >= 1 ? size : size * aspectRatio
          const height = aspectRatio >= 1 ? size / aspectRatio : size

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(state.src)
            return
          }

          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)

          ctx.save()
          ctx.translate(width / 2, height / 2)
          ctx.rotate((state.rotation * Math.PI) / 180)
          ctx.scale(state.zoom, state.zoom)
          ctx.translate(
            state.position.x / state.zoom,
            state.position.y / state.zoom,
          )
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          ctx.restore()

          resolve(canvas.toDataURL(`image/${outputFormat}`, outputQuality))
        }
        img.src = state.src
      })
    },
    [aspectRatio, outputFormat, outputQuality],
  )

  const handleZoomChange = useCallback((zoom: number) => {
    if (imageStateRef.current) {
      const newState = { ...imageStateRef.current, zoom }
      imageStateRef.current = newState
      setImageState(newState)
    }
  }, [])

  const handleRotate = useCallback(() => {
    if (imageStateRef.current) {
      const newState = {
        ...imageStateRef.current,
        rotation: (imageStateRef.current.rotation + 90) % 360,
      }
      imageStateRef.current = newState
      setImageState(newState)
    }
  }, [])

  const handlePositionChange = useCallback((x: number, y: number) => {
    if (imageStateRef.current) {
      const newState = { ...imageStateRef.current, position: { x, y } }
      imageStateRef.current = newState
      setImageState(newState)
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > maxFileSize) {
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        const newState = {
          src,
          zoom: 1,
          rotation: 0,
          position: { x: 0, y: 0 },
        }
        imageStateRef.current = newState
        setImageState(newState)
        setDialogOpen(true)
      }
      reader.readAsDataURL(file)
    },
    [maxFileSize],
  )

  const handleApply = useCallback(() => {
    const imageState = imageStateRef.current
    if (!imageState) return

    startTransition(async () => {
      const result = await processImage(imageStateRef.current!)
      field.onChange(result)
      setDialogOpen(false)
      imageStateRef.current = null
      setImageState(null)
    })
  }, [field, processImage])

  const handleCancel = useCallback(() => {
    setDialogOpen(false)
    imageStateRef.current = null
    setImageState(null)
  }, [])

  const handleRemove = useCallback(() => {
    field.onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [field])

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const previewStyle = useMemo(
    () => ({
      width: aspectRatio >= 1 ? 150 : 150 * aspectRatio,
      height: aspectRatio >= 1 ? 150 / aspectRatio : 150,
    }),
    [aspectRatio],
  )

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled ?? false}
        className="hidden"
      />
      {field.value ? (
        <div className="relative inline-block">
          <div
            className={cn(
              'border-muted-foreground/25 overflow-hidden border-2 border-dashed',
              cropShape === 'round' ? 'rounded-full' : 'rounded-lg',
            )}
            style={previewStyle}
          >
            <NextImage
              src={field.value}
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
            onClick={handleRemove}
            disabled={disabled ?? false}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled ?? false}
          className={cn(
            'h-auto flex-col gap-2 p-6',
            hasError && 'border-destructive',
          )}
        >
          <Upload className="text-muted-foreground h-8 w-8" />
          <span>{labels.upload}</span>
        </Button>
      )}
      {field.value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={disabled ?? false}
        >
          {labels.change}
        </Button>
      )}
      <CropDialog
        open={dialogOpen}
        imageState={imageState}
        imageStateRef={imageStateRef}
        aspectRatio={aspectRatio}
        cropShape={cropShape}
        labels={labels}
        isPending={isPending}
        onZoomChange={handleZoomChange}
        onRotate={handleRotate}
        onPositionChange={handlePositionChange}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  )
})
