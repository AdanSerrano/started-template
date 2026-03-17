import { useCallback, useRef, useState } from 'react'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
}

interface UseSignatureCanvasOptions {
  field: ControllerRenderProps<FieldValues, string>
  disabled?: boolean | undefined
  width: number
  height: number
  strokeColor: string
  strokeWidth: number
  backgroundColor: string
  outputFormat: 'png' | 'jpeg' | 'svg'
}

export function useSignatureCanvas({
  field,
  disabled,
  width,
  height,
  strokeColor,
  strokeWidth,
  backgroundColor,
  outputFormat,
}: UseSignatureCanvasOptions) {
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

  const hasStrokes = strokeCount > 0

  return {
    canvasRef,
    hasStrokes,
    handleStart,
    handleMove,
    handleEnd,
    handleClear,
    handleUndo,
    handleDownload,
  }
}
