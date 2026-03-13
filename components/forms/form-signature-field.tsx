'use client'

import { memo, useCallback, useRef, useMemo, useState } from 'react'
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
import { Eraser, Download, Undo, Pen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormSignatureFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  width?: number | undefined
  height?: number | undefined
  strokeColor?: string | undefined
  strokeWidth?: number | undefined
  backgroundColor?: string | undefined
  showDownload?: boolean | undefined
  showUndo?: boolean | undefined
  outputFormat?: 'png' | 'jpeg' | 'svg' | undefined
  labels?:
    | {
        clear?: string | undefined
        undo?: string | undefined
        download?: string | undefined
        placeholder?: string | undefined
      }
    | undefined
}

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
}

const DEFAULT_LABELS = {
  clear: 'Clear',
  undo: 'Undo',
  download: 'Download',
  placeholder: 'Sign here',
}

interface SignatureContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  width: number
  height: number
  strokeColor: string
  strokeWidth: number
  backgroundColor: string
  showDownload: boolean
  showUndo: boolean
  outputFormat: 'png' | 'jpeg' | 'svg'
  labels: typeof DEFAULT_LABELS
}

const SignatureContent = memo(function SignatureContent({
  field,
  hasError,
  disabled,
  width,
  height,
  strokeColor,
  strokeWidth,
  backgroundColor,
  showDownload,
  showUndo,
  outputFormat,
  labels,
}: SignatureContentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Point[]>([])
  const [strokeCount, setStrokeCount] = useState(0)

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        const touch = e.touches[0]!
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    [],
  )

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(stroke.points[0]!.x, stroke.points[0]!.y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i]!.x, stroke.points[i]!.y)
      }
      ctx.stroke()
    })
  }, [backgroundColor])

  const exportSignature = useCallback((): string => {
    const canvas = canvasRef.current
    if (!canvas) return ''

    if (outputFormat === 'svg') {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
      svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`

      strokesRef.current.forEach((stroke) => {
        if (stroke.points.length < 2) return
        const d = stroke.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ')
        svg += `<path d="${d}" stroke="${stroke.color}" stroke-width="${stroke.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      })

      svg += '</svg>'
      return `data:image/svg+xml;base64,${btoa(svg)}`
    }

    return canvas.toDataURL(`image/${outputFormat}`, 0.9)
  }, [width, height, backgroundColor, outputFormat])

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return
      e.preventDefault()
      isDrawingRef.current = true
      currentStrokeRef.current = [getCanvasPoint(e)]
    },
    [disabled, getCanvasPoint],
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current || disabled) return
      e.preventDefault()

      const point = getCanvasPoint(e)
      currentStrokeRef.current.push(point)

      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const points = currentStrokeRef.current
      if (points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const prev = points[points.length - 2]!
      const curr = points[points.length - 1]!
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)
      ctx.stroke()
    },
    [disabled, getCanvasPoint, strokeColor, strokeWidth],
  )

  const handleEnd = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    if (currentStrokeRef.current.length > 1) {
      strokesRef.current.push({
        points: [...currentStrokeRef.current],
        color: strokeColor,
        width: strokeWidth,
      })
      setStrokeCount(strokesRef.current.length)
      field.onChange(exportSignature())
    }

    currentStrokeRef.current = []
  }, [strokeColor, strokeWidth, field, exportSignature])

  const handleClear = useCallback(() => {
    strokesRef.current = []
    setStrokeCount(0)
    redrawCanvas()
    field.onChange('')
  }, [redrawCanvas, field])

  const handleUndo = useCallback(() => {
    strokesRef.current.pop()
    setStrokeCount(strokesRef.current.length)
    redrawCanvas()
    field.onChange(strokesRef.current.length > 0 ? exportSignature() : '')
  }, [redrawCanvas, field, exportSignature])

  const handleDownload = useCallback(() => {
    const dataUrl = exportSignature()
    const link = document.createElement('a')
    link.download = `signature.${outputFormat}`
    link.href = dataUrl
    link.click()
  }, [exportSignature, outputFormat])

  const containerClasses = useMemo(
    () =>
      cn(
        'relative rounded-lg border-2 border-dashed overflow-hidden',
        hasError ? 'border-destructive' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed',
      ),
    [hasError, disabled],
  )

  const hasStrokes = strokeCount > 0

  return (
    <div className="space-y-2">
      <div className={containerClasses}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full cursor-crosshair touch-none"
          style={{ backgroundColor }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        {!field.value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground/50 flex items-center gap-2">
              <Pen className="h-5 w-5" />
              <span className="text-sm">{labels.placeholder}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled || !field.value}
        >
          <Eraser className="mr-2 h-4 w-4" />
          {labels.clear}
        </Button>
        {showUndo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || !hasStrokes}
          >
            <Undo className="mr-2 h-4 w-4" />
            {labels.undo}
          </Button>
        )}
        {showDownload && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={disabled || !field.value}
          >
            <Download className="mr-2 h-4 w-4" />
            {labels.download}
          </Button>
        )}
      </div>
    </div>
  )
})

function FormSignatureFieldComponent<
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
  width = 400,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2,
  backgroundColor = '#ffffff',
  showDownload = true,
  showUndo = true,
  outputFormat = 'png',
  labels: customLabels,
}: FormSignatureFieldProps<TFieldValues, TName>) {
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
            <SignatureContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              width={width}
              height={height}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              backgroundColor={backgroundColor}
              showDownload={showDownload}
              showUndo={showUndo}
              outputFormat={outputFormat}
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

export const FormSignatureField = memo(
  FormSignatureFieldComponent,
) as typeof FormSignatureFieldComponent
