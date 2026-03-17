'use client'

import { ChevronDown } from 'lucide-react'
import { memo, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatCurrency, parseCurrencyInput } from './form-currency-field.utils'
import type { CurrencyConfig } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface CurrencyValue {
  amount: number
  currency: string
  formatted: string
}

export interface CurrencyContentProps {
  field: ControllerRenderProps<FieldValues, string>
  currencies: CurrencyConfig[]
  defaultCurrency: string
  showCurrencySelect: boolean
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  inputClassName?: string | undefined
  min?: number | undefined
  max?: number | undefined
}

export const CurrencyContent = memo(function CurrencyContent({
  field,
  currencies,
  defaultCurrency,
  showCurrencySelect,
  placeholder,
  disabled,
  hasError,
  inputClassName,
  min,
  max,
}: CurrencyContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const value: CurrencyValue = useMemo(
    () =>
      field.value ?? {
        amount: 0,
        currency: defaultCurrency,
        formatted: '',
      },
    [field.value, defaultCurrency],
  )

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === value.currency) ?? currencies[0]!,
    [currencies, value.currency],
  )

  const handleCurrencyChange = useCallback(
    (currency: CurrencyConfig) => {
      const formatted = formatCurrency(value.amount, currency)
      field.onChange({ ...value, currency: currency.code, formatted })
    },
    [field, value],
  )

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let amount = parseCurrencyInput(e.target.value)
      if (min !== undefined && amount < min) amount = min
      if (max !== undefined && amount > max) amount = max
      const formatted = formatCurrency(amount, selectedCurrency)
      field.onChange({ ...value, amount, formatted })
    },
    [field, value, selectedCurrency, min, max],
  )

  const handleBlur = useCallback(() => {
    const formatted = formatCurrency(value.amount, selectedCurrency)
    field.onChange({ ...value, formatted })
  }, [field, value, selectedCurrency])

  const displayValue =
    value.amount === 0
      ? ''
      : value.amount.toFixed(selectedCurrency.decimals ?? 2)

  return (
    <div className="flex gap-2">
      {showCurrencySelect && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              disabled={disabled ?? false}
              className={cn(
                'w-[100px] shrink-0 justify-between px-3',
                hasError && 'border-destructive',
              )}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono">{selectedCurrency.symbol}</span>
                <span className="text-muted-foreground">
                  {selectedCurrency.code}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[150px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {currencies.map((currency) => (
                    <CommandItem
                      key={currency.code}
                      value={currency.code}
                      onSelect={() => handleCurrencyChange(currency)}
                    >
                      <span className="mr-2 font-mono">{currency.symbol}</span>
                      <span>{currency.code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      <div className="relative flex-1">
        {!showCurrencySelect && (
          <span className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 font-mono">
            {selectedCurrency.symbol}
          </span>
        )}
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          disabled={disabled ?? false}
          value={displayValue}
          onChange={handleAmountChange}
          onBlur={handleBlur}
          className={cn(
            'bg-background font-mono',
            !showCurrencySelect && 'pl-8',
            hasError && 'border-destructive',
            inputClassName,
          )}
        />
      </div>
    </div>
  )
})
