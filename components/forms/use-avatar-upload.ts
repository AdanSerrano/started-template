import { useCallback, useRef } from 'react'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export function useAvatarUpload(
  field: ControllerRenderProps<FieldValues, string>,
  maxFileSize: number,
) {
  const inputRef = useRef<HTMLInputElement>(null)

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

  return { inputRef, handleFileSelect, handleRemove, handleClick }
}
