'use client'

import { Landmark, Check, X, Copy } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { COUNTRY_NAMES } from './form-iban-field.data'
import {
  DEFAULT_IBAN_MESSAGES,
  formatIBAN,
  getCountryCode,
  validateIBAN,
} from './form-iban-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type { IBANMessages } from './form-iban-field.utils'
import type { FieldPath, FieldValues } from 'react-hook-form'

export interface FormIBANFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  showValidation?: boolean | undefined
  showCountry?: boolean | undefined
  showCopy?: boolean | undefined
  messages?: Partial<typeof DEFAULT_IBAN_MESSAGES> | undefined
}

interface IBANContentProps {
  field: {
    value: string | undefined
    onChange: (value: string) => void
  }
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  showValidation: boolean
  showCountry: boolean
  showCopy: boolean
  messages: IBANMessages
}

const IBANContent = memo(function IBANContent({
  field,
  hasError,
  disabled,
  placeholder,
  showValidation,
  showCountry,
  showCopy,
  messages,
}: IBANContentProps) {
  const validation = useMemo(
    () => validateIBAN(field.value || '', messages),
    [field.value, messages],
  )

  const countryCode = useMemo(
    () => getCountryCode(field.value || ''),
    [field.value],
  )

  const countryName = COUNTRY_NAMES[countryCode]

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatIBAN(e.target.value)
      field.onChange(formatted)
    },
    [field],
  )

  const handleCopy = useCallback(() => {
    if (field.value) {
      navigator.clipboard.writeText(field.value.replace(/\s/g, ''))
    }
  }, [field.value])

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background pl-10 pr-10 font-mono uppercase tracking-wider',
        hasError && 'border-destructive',
      ),
    [hasError],
  )

  const validationBadgeClasses = useMemo(
    () =>
      cn(
        'text-xs',
        validation.valid
          ? 'text-green-600 border-green-600/30'
          : 'text-destructive border-destructive/30',
      ),
    [validation.valid],
  )

  return (
    <div className="space-y-2">
      <div className="relative">
        <Landmark className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
        <Input
          value={field.value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled ?? false}
          className={inputClasses}
          autoComplete="off"
        />
        {showCopy && field.value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
      {(showValidation || showCountry) && field.value && (
        <div className="flex flex-wrap items-center gap-2">
          {showValidation && (
            <Badge variant="outline" className={validationBadgeClasses}>
              {validation.valid ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  {messages.validIban}
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  {validation.error || messages.invalid}
                </>
              )}
            </Badge>
          )}
          {showCountry && countryName && (
            <Badge variant="secondary" className="text-xs">
              {countryCode} - {countryName}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
})

function FormIBANFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'DE89 3704 0044 0532 0130 00',
  disabled,
  className,
  required,
  showValidation = true,
  showCountry = true,
  showCopy = true,
  messages: customMessages,
}: FormIBANFieldProps<TFieldValues, TName>) {
  const messages = useMemo(
    () =>
      ({
        ...DEFAULT_IBAN_MESSAGES,
        ...customMessages,
      }) as IBANMessages,
    [customMessages],
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
            <IBANContent
              field={field}
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              showValidation={showValidation}
              showCountry={showCountry}
              showCopy={showCopy}
              messages={messages}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormIBANField = memo(
  FormIBANFieldComponent,
) as typeof FormIBANFieldComponent
