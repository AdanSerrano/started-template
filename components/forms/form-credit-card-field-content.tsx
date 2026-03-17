'use client'

import { CreditCard, Calendar, Lock } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  detectCardType,
  formatCardNumber,
  formatExpiry,
  formatCVC,
} from './form-credit-card-field.utils'
import type { CreditCardValue, CardType } from './form-credit-card-field.utils'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

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

export interface CreditCardContentProps {
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

export const CreditCardContent = memo(function CreditCardContent({
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
