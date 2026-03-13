'use client'

import {
  memo,
  useMemo,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react'
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
import { PasswordInput } from '@/components/ui/password-input.client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, X, Copy, CheckCheck } from 'lucide-react'
import type { BaseFormFieldProps } from './form-field.types'
import { calculatePasswordStrength } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface PasswordStrengthLabels {
  requirements?: string | undefined
  minChars?: string | undefined
  uppercase?: string | undefined
  lowercase?: string | undefined
  number?: string | undefined
  specialChar?: string | undefined
}

export interface FormPasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  autoComplete?: 'current-password' | 'new-password' | 'off' | undefined
  showStrengthIndicator?: boolean | undefined
  showRequirements?: boolean | undefined
  showCopyButton?: boolean | undefined
  strengthLabels?: PasswordStrengthLabels | undefined
  inputClassName?: string | undefined
  labelExtra?: ReactNode | undefined
  onCopied?: (() => void) | undefined
}

const STRENGTH_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
]

const STRENGTH_WIDTHS = ['w-0', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full']

interface PasswordContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  placeholder: string
  disabled?: boolean | undefined
  autoComplete: 'current-password' | 'new-password' | 'off'
  showStrengthIndicator: boolean
  showRequirements: boolean
  showCopyButton: boolean
  labels: Required<PasswordStrengthLabels>
  inputClassName?: string | undefined
  onCopied?: (() => void) | undefined
}

const PasswordContent = memo(function PasswordContent({
  field,
  hasError,
  placeholder,
  disabled,
  autoComplete,
  showStrengthIndicator,
  showRequirements,
  showCopyButton,
  labels,
  inputClassName,
  onCopied,
}: PasswordContentProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { level, requirements } = useMemo(
    () => calculatePasswordStrength(field.value ?? ''),
    [field.value],
  )

  const hasValue = Boolean(field.value)

  const handleCopy = useCallback(async () => {
    if (!field.value) return

    try {
      await navigator.clipboard.writeText(field.value)
      setCopied(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)

      onCopied?.()
    } catch {
      // Clipboard API not available
    }
  }, [field.value, onCopied])

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background',
        showCopyButton ? 'pr-20' : 'pr-10',
        hasError && 'border-destructive',
        inputClassName,
      ),
    [showCopyButton, hasError, inputClassName],
  )

  return (
    <>
      <div className="relative">
        <PasswordInput
          {...field}
          placeholder={placeholder}
          disabled={disabled ?? false}
          autoComplete={autoComplete}
          value={field.value ?? ''}
          className={inputClasses}
        />
        {showCopyButton && hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-10 h-7 w-7 -translate-y-1/2"
            onClick={handleCopy}
            disabled={disabled ?? false}
          >
            {copied ? (
              <CheckCheck className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {showStrengthIndicator && hasValue && (
        <div className="space-y-2">
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full transition-all duration-300',
                STRENGTH_COLORS[level],
                STRENGTH_WIDTHS[level + 1],
              )}
            />
          </div>
        </div>
      )}

      {showRequirements && hasValue && (
        <div className="border-border bg-muted/30 rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">{labels.requirements}</p>
          <div className="grid grid-cols-2 gap-2">
            {requirements.map((req) => (
              <div
                key={req.label}
                className={cn(
                  'flex items-center gap-2 text-xs',
                  req.met ? 'text-green-600' : 'text-muted-foreground',
                )}
              >
                {req.met ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                {labels[req.label as keyof PasswordStrengthLabels]}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
})

function FormPasswordFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '••••••••',
  disabled,
  className,
  required,
  tooltip,
  autoComplete = 'current-password',
  showStrengthIndicator = false,
  showRequirements = false,
  showCopyButton = false,
  strengthLabels,
  inputClassName,
  labelExtra,
  onCopied,
}: FormPasswordFieldProps<TFieldValues, TName>) {
  const labels = useMemo<Required<PasswordStrengthLabels>>(
    () => ({
      requirements: 'Password requirements',
      minChars: '8+ characters',
      uppercase: 'Uppercase letter',
      lowercase: 'Lowercase letter',
      number: 'Number',
      specialChar: 'Special character',
      ...strengthLabels,
    }),
    [strengthLabels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {(label || labelExtra) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {label && (
                  <FormLabel>
                    {label}
                    {required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                )}
                {tooltip && <FormFieldTooltip tooltip={tooltip} />}
              </div>
              {labelExtra}
            </div>
          )}
          <FormControl>
            <PasswordContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              autoComplete={autoComplete}
              showStrengthIndicator={showStrengthIndicator}
              showRequirements={showRequirements}
              showCopyButton={showCopyButton}
              labels={labels}
              inputClassName={inputClassName}
              onCopied={onCopied}
            />
          </FormControl>

          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormPasswordField = memo(
  FormPasswordFieldComponent,
) as typeof FormPasswordFieldComponent
