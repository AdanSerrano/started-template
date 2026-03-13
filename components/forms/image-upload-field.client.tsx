'use client'

import { memo, useCallback, useRef, useMemo } from 'react'
import NextImage from 'next/image'
import { Pencil, Trash2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  /** URL de la imagen ya guardada */
  value: string
  /** Archivo pendiente de subir (aun no guardado) */
  pendingFile: File | null
  /** Callback cuando se elimina la imagen (limpia URL) */
  onRemove: () => void
  /** Callback cuando el usuario selecciona un archivo */
  onFileSelect: (file: File | null) => void
  /** 'rect' | 'round' — default 'rect' */
  shape?: 'rect' | 'round'
  disabled?: boolean
  className?: string
}

export const ImageUploadField = memo(function ImageUploadField({
  value,
  pendingFile,
  onRemove,
  onFileSelect,
  shape = 'rect',
  disabled,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isRound = shape === 'round'

  const previewUrl = useMemo(() => {
    if (pendingFile) return URL.createObjectURL(pendingFile)
    return value
  }, [pendingFile, value])

  const hasImage = !!previewUrl

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith('image/')) onFileSelect(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [onFileSelect],
  )

  const handleRemove = useCallback(() => {
    onFileSelect(null)
    onRemove()
  }, [onRemove, onFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) onFileSelect(file)
    },
    [disabled, onFileSelect],
  )

  const prevent = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />

      {hasImage ? (
        <div className="flex flex-col gap-3">
          {/* Preview */}
          <div
            className={cn(
              'bg-muted relative shrink-0 overflow-hidden border',
              isRound ? 'size-24 rounded-full' : 'h-24 w-36 rounded-lg',
            )}
          >
            <NextImage
              src={previewUrl}
              alt="Preview"
              width={144}
              height={96}
              className="h-full w-full object-contain"
              unoptimized
            />
          </div>

          {/* Info + actions */}
          <div className="flex flex-col gap-2">
            {pendingFile && (
              <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Se guardara al enviar
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={disabled}
              >
                <Pencil className="mr-1.5 size-3.5" />
                Cambiar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleRemove}
                disabled={disabled}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Quitar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={prevent}
          className={cn(
            'group flex h-28 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-5 transition-all',
            'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <div
            className={cn(
              'bg-muted group-hover:bg-primary/10 flex shrink-0 items-center justify-center transition-colors',
              isRound ? 'size-16 rounded-full' : 'h-16 w-20 rounded-lg',
            )}
          >
            <ImageIcon className="text-muted-foreground group-hover:text-primary size-7 transition-colors" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">
              Haz clic para subir
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              o arrastra una imagen aqui
            </p>
            <p className="text-muted-foreground/60 mt-1 text-[11px]">
              JPG, PNG, WebP o SVG (max. 5 MB)
            </p>
          </div>
        </div>
      )}
    </div>
  )
})
