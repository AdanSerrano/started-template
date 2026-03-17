'use client'

import { memo, useCallback, useMemo, useRef } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { sanitizeMarkdownHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { MarkdownToolbar, type MarkdownAction } from './markdown-toolbar'
import type { BaseFormFieldProps } from './form-field.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

export interface FormMarkdownFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minHeight?: number | undefined
  maxHeight?: number | undefined
  showPreview?: boolean | undefined
  showToolbar?: boolean | undefined
}

const MarkdownPreview = memo(function MarkdownPreview({
  content,
  minHeight,
}: {
  content: string
  minHeight: number
}) {
  const html = useMemo(() => {
    if (!content) return ''
    const result = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^---$/gim, '<hr />')
      .replace(
        /\[(.*?)\]\((.*?)\)/gim,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      )
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br />')
    return sanitizeMarkdownHtml(result)
  }, [content])

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto p-3"
      style={{ minHeight: `${minHeight}px` }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

function FormMarkdownFieldComponent<
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
  showPreview = true,
  showToolbar = true,
}: FormMarkdownFieldProps<TFieldValues, TName>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAction = useCallback(
    (
      action: MarkdownAction,
      currentValue: string,
      onChange: (value: string) => void,
    ) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = currentValue.substring(start, end)
      let newText: string
      let newCursorPos: number
      if (action.block) {
        const lineStart = currentValue.lastIndexOf('\n', start - 1) + 1
        const beforeLine = currentValue.substring(0, lineStart)
        const afterStart = currentValue.substring(lineStart)
        newText = beforeLine + action.prefix + afterStart
        newCursorPos = lineStart + action.prefix.length
      } else {
        const before = currentValue.substring(0, start)
        const after = currentValue.substring(end)
        newText = before + action.prefix + selectedText + action.suffix + after
        newCursorPos =
          start +
          action.prefix.length +
          selectedText.length +
          action.suffix.length
      }
      onChange(newText)
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      })
    },
    [],
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
            <div
              className={cn(
                'bg-background overflow-hidden rounded-md border',
                fieldState.error && 'border-destructive',
                disabled && 'opacity-50',
              )}
            >
              {showPreview ? (
                <Tabs defaultValue="write" className="w-full">
                  <div className="flex items-center justify-between border-b px-2">
                    <TabsList className="h-9 bg-transparent">
                      <TabsTrigger value="write" className="text-xs">
                        Write
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs">
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="write" className="mt-0">
                    {showToolbar && (
                      <MarkdownToolbar
                        onAction={(action) =>
                          handleAction(
                            action,
                            field.value || '',
                            field.onChange,
                          )
                        }
                      />
                    )}
                    <Textarea
                      {...field}
                      ref={(el) => {
                        field.ref(el)
                        textareaRef.current = el
                      }}
                      value={field.value ?? ''}
                      placeholder={placeholder}
                      disabled={disabled ?? false}
                      className="resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                      style={{ minHeight: `${minHeight}px` }}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <MarkdownPreview
                      content={field.value || ''}
                      minHeight={minHeight}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  {showToolbar && (
                    <MarkdownToolbar
                      onAction={(action) =>
                        handleAction(action, field.value || '', field.onChange)
                      }
                    />
                  )}
                  <Textarea
                    {...field}
                    ref={(el) => {
                      field.ref(el)
                      textareaRef.current = el
                    }}
                    value={field.value ?? ''}
                    placeholder={placeholder}
                    disabled={disabled ?? false}
                    className="resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                    style={{ minHeight: `${minHeight}px` }}
                  />
                </>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormMarkdownField = memo(
  FormMarkdownFieldComponent,
) as typeof FormMarkdownFieldComponent
