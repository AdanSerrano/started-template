'use client'

import { memo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ZoomIn, ZoomOut, RotateCw, Move, Check, Loader2 } from 'lucide-react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import type { CropDialogProps } from './types'

export const CropDialog = memo(function CropDialog({
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
              <NextImage
                src={imageState.src}
                alt="Crop preview"
                width={500}
                height={500}
                className="max-w-none"
                draggable={false}
                unoptimized
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
