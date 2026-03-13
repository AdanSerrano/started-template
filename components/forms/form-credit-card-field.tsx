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
import { Input } from '@/components/ui/input'
import { CreditCard, Calendar, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface CreditCardValue {
  number?: string | undefined
  expiry?: string | undefined
  cvc?: string | undefined
  name?: string | undefined
}

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

export interface FormCreditCardFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showCardholderName?: boolean | undefined
  showCardType?: boolean | undefined
  labels?: {
    cardNumber?: string | undefined
    expiry?: string | undefined
    cvc?: string | undefined
    name?: string | undefined
  }
  placeholders?: {
    cardNumber?: string | undefined
    expiry?: string | undefined
    cvc?: string | undefined
    name?: string | undefined
  }
}

const DEFAULT_LABELS = {
  cardNumber: 'Card Number',
  expiry: 'Expiry',
  cvc: 'CVC',
  name: 'Cardholder Name',
}

const DEFAULT_PLACEHOLDERS = {
  cardNumber: '1234 5678 9012 3456',
  expiry: 'MM/YY',
  cvc: '123',
  name: 'John Doe',
}

const CARD_PATTERNS: { type: CardType; pattern: RegExp; icon: string }[] = [
  { type: 'visa', pattern: /^4/, icon: '💳' },
  { type: 'mastercard', pattern: /^5[1-5]/, icon: '💳' },
  { type: 'amex', pattern: /^3[47]/, icon: '💳' },
  { type: 'discover', pattern: /^6(?:011|5)/, icon: '💳' },
]

function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\s/g, '')
  for (const { type, pattern } of CARD_PATTERNS) {
    if (pattern.test(cleaned)) {
      return type
    }
  }
  return 'unknown'
}

function formatCardNumber(value: string, cardType: CardType): string {
  const cleaned = value.replace(/\D/g, '')
  const maxLength = cardType === 'amex' ? 15 : 16
  const truncated = cleaned.slice(0, maxLength)

  if (cardType === 'amex') {
    return truncated.replace(/(\d{4})(\d{6})?(\d{5})?/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    )
  }

  return truncated.replace(/(\d{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  const truncated = cleaned.slice(0, 4)

  if (truncated.length >= 2) {
    return `${truncated.slice(0, 2)}/${truncated.slice(2)}`
  }
  return truncated
}

function formatCVC(value: string, cardType: CardType): string {
  const cleaned = value.replace(/\D/g, '')
  const maxLength = cardType === 'amex' ? 4 : 3
  return cleaned.slice(0, maxLength)
}

const CardTypeIcon = memo(function CardTypeIcon({ type }: { type: CardType }) {
  const colors: Record<CardType, string> = {
    visa: 'text-blue-600',
    mastercard: 'text-orange-600',
    amex: 'text-blue-700',
    discover: 'text-orange-500',
    unknown: 'text-muted-foreground',
  }

  const labels: Record<CardType, string> = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    discover: 'DISC',
    unknown: '',
  }

  if (type === 'unknown') {
    return <CreditCard className="text-muted-foreground h-5 w-5" />
  }

  return (
    <span className={cn('text-xs font-bold', colors[type])}>
      {labels[type]}
    </span>
  )
})

interface CreditCardContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showCardholderName: boolean
  showCardType: boolean
  labels: {
    cardNumber: string
    expiry: string
    cvc: string
    name: string
  }
  placeholders: {
    cardNumber: string
    expiry: string
    cvc: string
    name: string
  }
}

const CreditCardContent = memo(function CreditCardContent({
  field,
  hasError,
  disabled,
  showCardholderName,
  showCardType,
  labels,
  placeholders,
}: CreditCardContentProps) {
  const value = useMemo(
    () => (field.value || {}) as CreditCardValue,
    [field.value],
  )

  const cardType = useMemo(
    () => detectCardType(value.number || ''),
    [value.number],
  )

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentType = detectCardType(e.target.value)
      const formatted = formatCardNumber(e.target.value, currentType)
      field.onChange({ ...value, number: formatted })
    },
    [field, value],
  )

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatExpiry(e.target.value)
      field.onChange({ ...value, expiry: formatted })
    },
    [field, value],
  )

  const handleCVCChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCVC(e.target.value, cardType)
      field.onChange({ ...value, cvc: formatted })
    },
    [field, value, cardType],
  )

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange({ ...value, name: e.target.value.toUpperCase() })
    },
    [field, value],
  )

  const containerClasses = useMemo(
    () =>
      cn('rounded-lg border p-4 space-y-4', hasError && 'border-destructive'),
    [hasError],
  )

  const numberInputClasses = useMemo(
    () => cn('bg-background pr-16', hasError && 'border-destructive'),
    [hasError],
  )

  const inputClasses = useMemo(
    () => cn('bg-background', hasError && 'border-destructive'),
    [hasError],
  )

  const nameInputClasses = useMemo(
    () => cn('bg-background uppercase', hasError && 'border-destructive'),
    [hasError],
  )

  return (
    <div className={containerClasses}>
      <div className="space-y-1">
        <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
          <CreditCard className="h-3 w-3" />
          {labels.cardNumber}
        </label>
        <div className="relative">
          <Input
            value={value.number || ''}
            onChange={handleNumberChange}
            placeholder={placeholders.cardNumber}
            disabled={disabled ?? false}
            className={numberInputClasses}
            autoComplete="cc-number"
          />
          {showCardType && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <CardTypeIcon type={cardType} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <Calendar className="h-3 w-3" />
            {labels.expiry}
          </label>
          <Input
            value={value.expiry || ''}
            onChange={handleExpiryChange}
            placeholder={placeholders.expiry}
            disabled={disabled ?? false}
            className={inputClasses}
            autoComplete="cc-exp"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <Lock className="h-3 w-3" />
            {labels.cvc}
          </label>
          <Input
            type="password"
            value={value.cvc || ''}
            onChange={handleCVCChange}
            placeholder={placeholders.cvc}
            disabled={disabled ?? false}
            className={inputClasses}
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {showCardholderName && (
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs font-medium">
            {labels.name}
          </label>
          <Input
            value={value.name || ''}
            onChange={handleNameChange}
            placeholder={placeholders.name}
            disabled={disabled ?? false}
            className={nameInputClasses}
            autoComplete="cc-name"
          />
        </div>
      )}
    </div>
  )
})

function FormCreditCardFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  required,
  showCardholderName = true,
  showCardType = true,
  labels: customLabels,
  placeholders: customPlaceholders,
}: FormCreditCardFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
    [customLabels],
  )
  const placeholders = useMemo(
    () =>
      ({
        ...DEFAULT_PLACEHOLDERS,
        ...customPlaceholders,
      }) as typeof DEFAULT_PLACEHOLDERS,
    [customPlaceholders],
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
            <CreditCardContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              showCardholderName={showCardholderName}
              showCardType={showCardType}
              labels={labels}
              placeholders={placeholders}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormCreditCardField = memo(
  FormCreditCardFieldComponent,
) as typeof FormCreditCardFieldComponent
