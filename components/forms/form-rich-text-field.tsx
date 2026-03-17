'use client'

import { memo, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { RichTextToolbar, type ToolbarAction } from './rich-text-toolbar'
import type { BaseFormFieldProps } from './form-field.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

export interface FormRichTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minHeight?: number | undefined
  maxHeight?: number | undefined
  showToolbar?: boolean | undefined
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  placeholder?: string | undefined
  disabled?: boolean | undefined
  hasError: boolean
  minHeight: number
  maxHeight: number
  showToolbar: boolean
}

const RichTextEditor = memo(function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  hasError,
  minHeight,
  maxHeight,
  showToolbar,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  useLayoutEffect(() => {
    if (editorRef.current && !isInitializedRef.current && value) {
      editorRef.current.innerHTML = sanitizeHtml(value)
      isInitializedRef.current = true
    }
  }, [value])

  const handleAction = useCallback((action: ToolbarAction, arg?: string) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    if (action === 'createLink') {
      const url = window.prompt('Enter URL:')
      if (url) {
        document.execCommand(action, false, url)
      }
    } else if (action === 'formatBlock' && arg) {
      document.execCommand(action, false, `<${arg}>`)
    } else {
      document.execCommand(action, false)
    }
  }, [])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const editorStyle = useMemo(
    () => ({
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
    }),
    [minHeight, maxHeight],
  )

  return (
    <div
      className={cn(
        'bg-background rounded-md border',
        hasError && 'border-destructive',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {showToolbar && <RichTextToolbar onAction={handleAction} />}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none overflow-y-auto p-3 focus:outline-hidden',
          !value && 'text-muted-foreground',
        )}
        style={editorStyle}
        onInput={handleInput}
        onBlur={onBlur}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
})

function FormRichTextFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  required,
  minHeight = 200,
  maxHeight = 400,
  showToolbar = true,
}: FormRichTextFieldProps<TFieldValues, TName>) {
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
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              minHeight={minHeight}
              maxHeight={maxHeight}
              showToolbar={showToolbar}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormRichTextField = memo(
  FormRichTextFieldComponent,
) as typeof FormRichTextFieldComponent
