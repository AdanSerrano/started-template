'use client'

import { memo, useCallback, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Braces, Copy, Check, WandSparkles, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormJsonFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minHeight?: number | undefined
  maxHeight?: number | undefined
  showToolbar?: boolean | undefined
  showValidation?: boolean | undefined
  allowFormat?: boolean | undefined
  allowMinify?: boolean | undefined
}

interface JsonValidation {
  isValid: boolean
  error?: string | undefined
  lineNumber?: number | undefined
}

function validateJson(value: string): JsonValidation {
  if (!value || !value.trim()) {
    return { isValid: true }
  }

  try {
    JSON.parse(value)
    return { isValid: true }
  } catch (e) {
    const error = e as SyntaxError
    const match = error.message.match(/position (\d+)/)
    let lineNumber: number | undefined

    if (match) {
      const position = parseInt(match[1]!, 10)
      const lines = value.substring(0, position).split('\n')
      lineNumber = lines.length
    }

    return {
      isValid: false,
      error: error.message,
      lineNumber,
    }
  }
}

function formatJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}

function minifyJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed)
  } catch {
    return value
  }
}

const JsonToolbar = memo(function JsonToolbar({
  validation,
  onFormat,
  onMinify,
  onCopy,
  showFormat,
  showMinify,
}: {
  validation: JsonValidation
  onFormat: () => void
  onMinify: () => void
  onCopy: () => void
  showFormat: boolean
  showMinify: boolean
}) {
  return (
    <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-2">
      <div className="flex items-center gap-2">
        <Braces className="text-muted-foreground h-4 w-4" />
        <span className="text-xs font-medium">JSON</span>
        {validation.isValid ? (
          <Badge
            variant="outline"
            className="border-green-600/30 text-xs text-green-600"
          >
            <Check className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-destructive border-destructive/30 text-xs"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        {showFormat && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onFormat}
            disabled={!validation.isValid}
            className="h-7 text-xs"
          >
            <WandSparkles className="mr-1 h-3 w-3" />
            Format
          </Button>
        )}
        {showMinify && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMinify}
            disabled={!validation.isValid}
            className="h-7 text-xs"
          >
            Minify
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="h-7 w-7"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
})

const LineNumbers = memo(function LineNumbers({ count }: { count: number }) {
  const lines = useMemo(
    () => Array.from({ length: Math.max(1, count) }, (_, i) => i + 1),
    [count],
  )

  return (
    <div className="text-muted-foreground/50 border-r pt-3 pr-3 text-right font-mono text-sm leading-6 select-none">
      {lines.map((num) => (
        <div key={num}>{num}</div>
      ))}
    </div>
  )
})

interface JsonContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  minHeight: number
  maxHeight: number
  showToolbar: boolean
  showValidation: boolean
  allowFormat: boolean
  allowMinify: boolean
}

const JsonContent = memo(function JsonContent({
  field,
  hasError,
  disabled,
  placeholder,
  minHeight,
  maxHeight,
  showToolbar,
  showValidation,
  allowFormat,
  allowMinify,
}: JsonContentProps) {
  const validation = useMemo(
    () => validateJson(field.value || ''),
    [field.value],
  )

  const lineCount = useMemo(
    () => (field.value || '').split('\n').length,
    [field.value],
  )

  const handleFormat = useCallback(() => {
    field.onChange(formatJson(field.value || ''))
  }, [field])

  const handleMinify = useCallback(() => {
    field.onChange(minifyJson(field.value || ''))
  }, [field])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(field.value || '')
  }, [field.value])

  const containerClasses = useMemo(
    () =>
      cn(
        'rounded-md border bg-background overflow-hidden',
        hasError && 'border-destructive',
        !validation.isValid && showValidation && 'border-amber-500',
        disabled && 'opacity-50',
      ),
    [hasError, validation.isValid, showValidation, disabled],
  )

  const textareaClasses = useMemo(
    () =>
      cn(
        'flex-1 border-0 bg-transparent font-mono text-sm',
        'focus-visible:ring-0 resize-none leading-6 rounded-none',
      ),
    [],
  )

  return (
    <div className={containerClasses}>
      {showToolbar && (
        <JsonToolbar
          validation={validation}
          onFormat={handleFormat}
          onMinify={handleMinify}
          onCopy={handleCopy}
          showFormat={allowFormat}
          showMinify={allowMinify}
        />
      )}
      <div
        className="flex overflow-auto"
        style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
      >
        <LineNumbers count={lineCount} />
        <Textarea
          {...field}
          value={field.value ?? ''}
          placeholder={placeholder}
          disabled={disabled ?? false}
          className={textareaClasses}
          style={{ minHeight: `${minHeight}px` }}
          spellCheck={false}
        />
      </div>
      {!validation.isValid && validation.error && showValidation && (
        <div className="bg-destructive/10 text-destructive border-t px-3 py-2 text-xs">
          <AlertCircle className="mr-1 inline h-3 w-3" />
          {validation.lineNumber && `Line ${validation.lineNumber}: `}
          {validation.error}
        </div>
      )}
    </div>
  )
})

function FormJsonFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '{\n  "key": "value"\n}',
  disabled,
  className,
  required,
  minHeight = 200,
  maxHeight = 500,
  showToolbar = true,
  showValidation = true,
  allowFormat = true,
  allowMinify = true,
}: FormJsonFieldProps<TFieldValues, TName>) {
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
            <JsonContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              minHeight={minHeight}
              maxHeight={maxHeight}
              showToolbar={showToolbar}
              showValidation={showValidation}
              allowFormat={allowFormat}
              allowMinify={allowMinify}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormJsonField = memo(
  FormJsonFieldComponent,
) as typeof FormJsonFieldComponent
