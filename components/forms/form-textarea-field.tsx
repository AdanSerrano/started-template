'use client'

import { memo, useCallback, useRef, useMemo } from 'react'
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
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormTextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  rows?: number | undefined
  maxLength?: number | undefined
  minLength?: number | undefined
  showCharCount?: boolean | undefined
  resizable?: boolean | undefined
  autoResize?: boolean | undefined
  minRows?: number | undefined
  maxRows?: number | undefined
  inputClassName?: string | undefined
}

interface TextareaContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  placeholder?: string | undefined
  disabled?: boolean | undefined
  rows: number
  maxLength?: number | undefined
  minLength?: number | undefined
  resizable: boolean
  autoResize: boolean
  minRows: number
  maxRows: number
  inputClassName?: string | undefined
}

const TextareaContent = memo(function TextareaContent({
  field,
  hasError,
  placeholder,
  disabled,
  rows,
  maxLength,
  minLength,
  resizable,
  autoResize,
  minRows,
  maxRows,
  inputClassName,
}: TextareaContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const lastHeightRef = useRef<number | null>(null)

  const adjustHeight = useCallback(
    (element: HTMLTextAreaElement | null) => {
      if (!element || !autoResize) return

      element.style.height = 'auto'
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20
      const minHeight = minRows * lineHeight
      const maxHeight = maxRows * lineHeight
      const scrollHeight = element.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)

      if (lastHeightRef.current !== newHeight) {
        lastHeightRef.current = newHeight
        element.style.height = `${newHeight}px`
      }
    },
    [autoResize, minRows, maxRows],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      field.onChange(e)
      adjustHeight(e.target)
    },
    [field, adjustHeight],
  )

  const setRef = useCallback(
    (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element
      if (typeof field.ref === 'function') {
        field.ref(element)
      }
      if (element && autoResize) {
        adjustHeight(element)
      }
    },
    [field, autoResize, adjustHeight],
  )

  const textareaClassName = useMemo(
    () =>
      cn(
        'bg-background',
        (!resizable || autoResize) && 'resize-none',
        autoResize && 'overflow-hidden',
        hasError && 'border-destructive',
        inputClassName,
      ),
    [resizable, autoResize, hasError, inputClassName],
  )

  return (
    <Textarea
      {...field}
      ref={setRef}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled ?? false}
      rows={autoResize ? minRows : rows}
      maxLength={maxLength}
      minLength={minLength}
      value={field.value ?? ''}
      className={textareaClassName}
    />
  )
})

interface CharCountProps {
  currentLength: number
  maxLength: number
}

const CharCount = memo(function CharCount({
  currentLength,
  maxLength,
}: CharCountProps) {
  return (
    <span className="text-muted-foreground text-xs">
      {currentLength}/{maxLength}
    </span>
  )
})

function FormTextareaFieldComponent<
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
  tooltip,
  rows = 3,
  maxLength,
  minLength,
  showCharCount,
  resizable = true,
  autoResize = false,
  minRows = 2,
  maxRows = 10,
  inputClassName,
}: FormTextareaFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <FormControl>
            <TextareaContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              rows={rows}
              maxLength={maxLength}
              minLength={minLength}
              resizable={resizable}
              autoResize={autoResize}
              minRows={minRows}
              maxRows={maxRows}
              inputClassName={inputClassName}
            />
          </FormControl>
          <div className="flex items-center justify-between gap-2">
            {description && (
              <FormDescription className="flex-1 text-xs">
                {description}
              </FormDescription>
            )}
            {showCharCount && maxLength && (
              <CharCount
                currentLength={field.value?.length ?? 0}
                maxLength={maxLength}
              />
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormTextareaField = memo(
  FormTextareaFieldComponent,
) as typeof FormTextareaFieldComponent
