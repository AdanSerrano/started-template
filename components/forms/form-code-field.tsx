'use client'

import { memo, useMemo, useCallback } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'html'
  | 'css'
  | 'sql'
  | 'json'
  | 'yaml'
  | 'bash'
  | 'plaintext'

const LANGUAGE_OPTIONS: { value: CodeLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
]

export interface FormCodeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  language?: CodeLanguage | undefined
  onLanguageChange?: ((language: CodeLanguage) => void) | undefined
  showLanguageSelector?: boolean | undefined
  showLineNumbers?: boolean | undefined
  showCopyButton?: boolean | undefined
  minHeight?: number | undefined
  maxHeight?: number | undefined
  readOnly?: boolean | undefined
}

const LineNumbers = memo(function LineNumbers({ count }: { count: number }) {
  const lines = useMemo(
    () => Array.from({ length: Math.max(1, count) }, (_, i) => i + 1),
    [count],
  )

  return (
    <div className="text-muted-foreground/50 pr-3 text-right font-mono text-sm leading-6 select-none">
      {lines.map((num) => (
        <div key={num}>{num}</div>
      ))}
    </div>
  )
})

const CopyButton = memo(function CopyButton({
  copied,
  onCopy,
}: {
  copied: boolean
  onCopy: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
})

function FormCodeFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '// Enter your code here...',
  disabled,
  className,
  required,
  language = 'plaintext',
  onLanguageChange,
  showLanguageSelector = true,
  showLineNumbers = true,
  showCopyButton = true,
  minHeight = 200,
  maxHeight = 500,
  readOnly = false,
}: FormCodeFieldProps<TFieldValues, TName>) {
  const copiedRef = { current: false }

  const handleCopy = useCallback((value: string) => {
    navigator.clipboard.writeText(value)
  }, [])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const lineCount = (field.value || '').split('\n').length

        return (
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
                  'overflow-hidden rounded-md border bg-zinc-950 text-zinc-50',
                  fieldState.error && 'border-destructive',
                  disabled && 'opacity-50',
                )}
              >
                <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                  {showLanguageSelector && onLanguageChange ? (
                    <Select
                      value={language}
                      onValueChange={(v) => onLanguageChange(v as CodeLanguage)}
                    >
                      <SelectTrigger className="h-8 w-32 border-zinc-700 bg-transparent text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-zinc-400">
                      {LANGUAGE_OPTIONS.find((l) => l.value === language)
                        ?.label || language}
                    </span>
                  )}
                  {showCopyButton && (
                    <CopyButton
                      copied={copiedRef.current}
                      onCopy={() => handleCopy(field.value || '')}
                    />
                  )}
                </div>
                <div
                  className="flex overflow-auto"
                  style={{
                    minHeight: `${minHeight}px`,
                    maxHeight: `${maxHeight}px`,
                  }}
                >
                  {showLineNumbers && <LineNumbers count={lineCount} />}
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    placeholder={placeholder}
                    disabled={disabled ?? false}
                    readOnly={readOnly}
                    className={cn(
                      'flex-1 border-0 bg-transparent font-mono text-sm text-zinc-50',
                      'resize-none p-0 leading-6 focus-visible:ring-0',
                      showLineNumbers && 'pl-0',
                    )}
                    style={{ minHeight: `${minHeight}px` }}
                    spellCheck={false}
                  />
                </div>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export const FormCodeField = memo(
  FormCodeFieldComponent,
) as typeof FormCodeFieldComponent
