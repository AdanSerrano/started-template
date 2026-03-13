'use client'

import { memo, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo,
  Redo,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'createLink'
  | 'undo'
  | 'redo'
  | 'formatBlock'

interface ToolbarButton {
  action: ToolbarAction
  icon: React.ElementType
  label: string
  arg?: string | undefined
}

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { action: 'bold', icon: Bold, label: 'Bold' },
    { action: 'italic', icon: Italic, label: 'Italic' },
    { action: 'underline', icon: Underline, label: 'Underline' },
    { action: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  ],
  [
    { action: 'formatBlock', icon: Heading1, label: 'Heading 1', arg: 'h1' },
    { action: 'formatBlock', icon: Heading2, label: 'Heading 2', arg: 'h2' },
    { action: 'formatBlock', icon: Heading3, label: 'Heading 3', arg: 'h3' },
  ],
  [
    { action: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { action: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { action: 'formatBlock', icon: Quote, label: 'Quote', arg: 'blockquote' },
    { action: 'formatBlock', icon: Code, label: 'Code', arg: 'pre' },
  ],
  [
    { action: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { action: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { action: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ],
  [{ action: 'createLink', icon: Link, label: 'Insert Link' }],
  [
    { action: 'undo', icon: Undo, label: 'Undo' },
    { action: 'redo', icon: Redo, label: 'Redo' },
  ],
]

export interface FormRichTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  minHeight?: number | undefined
  maxHeight?: number | undefined
  showToolbar?: boolean | undefined
  toolbarGroups?: (keyof typeof TOOLBAR_GROUPS)[] | undefined
}

const ToolbarButtonComponent = memo(function ToolbarButton({
  button,
  onAction,
}: {
  button: ToolbarButton
  onAction: (action: ToolbarAction, arg?: string) => void
}) {
  const Icon = button.icon
  return (
    <Toggle
      size="sm"
      aria-label={button.label}
      onPressedChange={() => onAction(button.action, button.arg)}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  )
})

const Toolbar = memo(function Toolbar({
  onAction,
}: {
  onAction: (action: ToolbarAction, arg?: string) => void
}) {
  return (
    <div className="bg-muted/30 flex flex-wrap items-center gap-1 border-b p-1">
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center">
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-6" />
          )}
          {group.map((button, buttonIndex) => (
            <ToolbarButtonComponent
              key={`${groupIndex}-${buttonIndex}`}
              button={button}
              onAction={onAction}
            />
          ))}
        </div>
      ))}
    </div>
  )
})

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
      editorRef.current.innerHTML = value
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
      {showToolbar && <Toolbar onAction={handleAction} />}
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
