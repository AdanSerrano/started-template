'use client'

import { memo, useMemo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, InputType } from './form-field.types'

export interface FormConfirmFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  confirmValue: string
  type?: InputType | 'password' | undefined
  showMatchIndicator?: boolean | undefined
  caseSensitive?: boolean | undefined
  labels?: {
    match?: string | undefined
    noMatch?: string | undefined
  }
}

const DEFAULT_LABELS = {
  match: 'Match',
  noMatch: 'Does not match',
}

function FormConfirmFieldComponent<
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
  confirmValue,
  type = 'text',
  showMatchIndicator = true,
  caseSensitive = true,
  labels: customLabels,
}: FormConfirmFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
    [customLabels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const currentValue = field.value ?? ''
        const compareValue = caseSensitive
          ? currentValue
          : currentValue.toLowerCase()
        const compareConfirm = caseSensitive
          ? confirmValue
          : confirmValue.toLowerCase()

        const isMatch =
          currentValue.length > 0 && compareValue === compareConfirm
        const hasValue = currentValue.length > 0
        const showIndicator = showMatchIndicator && hasValue

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    {...field}
                    type={type}
                    value={currentValue}
                    placeholder={placeholder}
                    disabled={disabled ?? false}
                    className={cn(
                      'bg-background pr-10',
                      fieldState.error && 'border-destructive',
                      showIndicator &&
                        isMatch &&
                        'border-green-500 focus-visible:ring-green-500',
                      showIndicator &&
                        !isMatch &&
                        'border-amber-500 focus-visible:ring-amber-500',
                    )}
                  />
                  {showIndicator && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      {isMatch ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  )}
                </div>

                {showIndicator && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      isMatch
                        ? 'border-green-600/30 text-green-600'
                        : 'border-amber-600/30 text-amber-600',
                    )}
                  >
                    {isMatch ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        {labels.match}
                      </>
                    ) : (
                      <>
                        <X className="mr-1 h-3 w-3" />
                        {labels.noMatch}
                      </>
                    )}
                  </Badge>
                )}
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

export const FormConfirmField = memo(
  FormConfirmFieldComponent,
) as typeof FormConfirmFieldComponent
