'use client'

import {
  memo,
  useCallback,
  useRef,
  useMemo,
  useState,
  useTransition,
} from 'react'
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
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Move,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface FormImageCropFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  aspectRatio?: number | undefined
  minWidth?: number | undefined
  minHeight?: number | undefined
  maxFileSize?: number | undefined
  accept?: string | undefined
  outputFormat?: 'jpeg' | 'png' | 'webp' | undefined
  outputQuality?: number | undefined
  cropShape?: 'rect' | 'round' | undefined
  labels?:
    | {
        upload?: string | undefined
        change?: string | undefined
        remove?: string | undefined
        crop?: string | undefined
        cancel?: string | undefined
        apply?: string | undefined
        zoom?: string | undefined
        rotate?: string | undefined
      }
    | undefined
}

interface ImageState {
  src: string
  zoom: number
  rotation: number
  position: { x: number; y: number }
}

const DEFAULT_LABELS = {
  upload: 'Upload Image',
  change: 'Change',
  remove: 'Remove',
  crop: 'Crop Image',
  cancel: 'Cancel',
  apply: 'Apply',
  zoom: 'Zoom',
  rotate: 'Rotate',
}

interface CropDialogProps {
  open: boolean
  imageState: ImageState | null
  imageStateRef: React.MutableRefObject<ImageState | null>
  aspectRatio: number
  cropShape: 'rect' | 'round'
  labels: typeof DEFAULT_LABELS
  isPending: boolean
  onZoomChange: (zoom: number) => void
  onRotate: () => void
  onPositionChange: (x: number, y: number) => void
  onApply: () => void
  onCancel: () => void
}

const CropDialog = memo(function CropDialog({
  open,
  imageState,
  imageStateRef,
  aspectRatio,
  cropShape,
  labels,
  isPending,
  onZoomChange,
  onRotate,
  onPositionChange,
  onApply,
  onCancel,
}: CropDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const imageState = imageStateRef.current
      if (!isDragging.current || !imageState) return
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      startPos.current = { x: e.clientX, y: e.clientY }
      onPositionChange(imageState.position.x + dx, imageState.position.y + dy)
    },
    [imageStateRef, onPositionChange],
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleSliderChange = useCallback(
    ([v]: number[]) => {
      onZoomChange(v!)
    },
    [onZoomChange],
  )

  if (!imageState) return null

  const cropAreaStyle = (() => {
    const size = 250
    const width = aspectRatio >= 1 ? size : size * aspectRatio
    const height = aspectRatio >= 1 ? size / aspectRatio : size
    return { width, height }
  })()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.crop}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative h-[300px] cursor-move overflow-hidden rounded-lg bg-black/90"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${imageState.position.x}px, ${imageState.position.y}px) scale(${imageState.zoom}) rotate(${imageState.rotation}deg)`,
              }}
            >
              <img
                src={imageState.src}
                alt="Crop preview"
                className="max-w-none"
                draggable={false}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  'border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]',
                  cropShape === 'round' && 'rounded-full',
                )}
                style={cropAreaStyle}
              />
            </div>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
              <Move className="h-3 w-3" />
              Drag to reposition
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ZoomOut className="text-muted-foreground h-4 w-4" />
              <Slider
                value={[imageState.zoom]}
                onValueChange={handleSliderChange}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRotate}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                {labels.rotate} 90°
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {labels.cancel}
          </Button>
          <Button type="button" onClick={onApply} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {labels.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

interface ImageCropContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  aspectRatio: number
  maxFileSize: number
  accept: string
  outputFormat: 'jpeg' | 'png' | 'webp'
  outputQuality: number
  cropShape: 'rect' | 'round'
  labels: typeof DEFAULT_LABELS
}

const ImageCropContent = memo(function ImageCropContent({
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
            <img
              src={field.value}
              alt="Preview"
              className="h-full w-full object-cover"
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
