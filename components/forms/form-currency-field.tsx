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
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { BaseFormFieldProps, CurrencyConfig } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface CurrencyValue {
  amount: number
  currency: string
  formatted: string
}

export interface FormCurrencyFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  currencies?: CurrencyConfig[] | undefined
  defaultCurrency?: string | undefined
  showCurrencySelect?: boolean | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  inputClassName?: string | undefined
}

const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', locale: 'en-GB', decimals: 2 },
  { code: 'MXN', symbol: '$', locale: 'es-MX', decimals: 2 },
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', decimals: 0 },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', locale: 'de-CH', decimals: 2 },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', decimals: 2 },
]

function formatCurrency(amount: number, currency: CurrencyConfig): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals ?? 2,
    maximumFractionDigits: currency.decimals ?? 2,
  }).format(amount)
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.')
  const number = parseFloat(cleaned)
  return isNaN(number) ? 0 : number
}

interface CurrencyContentProps {
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

const CurrencyContent = memo(function CurrencyContent({
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
      field.onChange({
        ...value,
        currency: currency.code,
        formatted,
      })
    },
    [field, value],
  )

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let amount = parseCurrencyInput(e.target.value)

      if (min !== undefined && amount < min) amount = min
      if (max !== undefined && amount > max) amount = max

      const formatted = formatCurrency(amount, selectedCurrency)
      field.onChange({
        ...value,
        amount,
        formatted,
      })
    },
    [field, value, selectedCurrency, min, max],
  )

  const handleBlur = useCallback(() => {
    const formatted = formatCurrency(value.amount, selectedCurrency)
    field.onChange({
      ...value,
      formatted,
    })
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

function FormCurrencyFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '0.00',
  disabled,
  className,
  required,
  tooltip,
  currencies = AVAILABLE_CURRENCIES,
  defaultCurrency = 'USD',
  showCurrencySelect = true,
  min,
  max,
  inputClassName,
}: FormCurrencyFieldProps<TFieldValues, TName>) {
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
            <CurrencyContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              currencies={currencies}
              defaultCurrency={defaultCurrency}
              showCurrencySelect={showCurrencySelect}
              placeholder={placeholder}
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              inputClassName={inputClassName}
              min={min}
              max={max}
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

export const FormCurrencyField = memo(
  FormCurrencyFieldComponent,
) as typeof FormCurrencyFieldComponent
