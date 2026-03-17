'use client'

import { ChevronDown, Phone } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import { formatPhoneNumber } from './form-phone-field.data'
import type { CountryCode } from './form-phone-field.data'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface PhoneValue {
  countryCode: string
  dialCode: string
  number: string
  formatted: string
}

export interface PhoneContentProps {
  field: ControllerRenderProps<FieldValues, string>
  countries: CountryCode[]
  defaultCountry: string
  showCountrySelect: boolean
  formatOnBlur: boolean
  placeholder: string
  disabled?: boolean | undefined
  hasError: boolean
  inputClassName?: string | undefined
  mergedLabels: { searchCountry: string; noCountryFound: string }
}

export const PhoneContent = memo(function PhoneContent({
  field,
  countries,
  defaultCountry,
  showCountrySelect,
  formatOnBlur,
  placeholder,
  disabled,
  hasError,
  inputClassName,
  mergedLabels,
}: PhoneContentProps) {
  const value: PhoneValue = useMemo(
    () =>
      field.value ?? {
        countryCode: defaultCountry,
        dialCode:
          countries.find((c) => c.code === defaultCountry)?.dialCode ?? '+1',
        number: '',
        formatted: '',
      },
    [field.value, defaultCountry, countries],
  )
  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === value.countryCode) ?? countries[0]!,
    [countries, value.countryCode],
  )
  const handleCountryChange = useCallback(
    (country: CountryCode) => {
      const formatted = `${country.dialCode} ${formatPhoneNumber(value.number)}`
      field.onChange({
        ...value,
        countryCode: country.code,
        dialCode: country.dialCode,
        formatted,
      })
    },
    [field, value],
  )
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawNumber = e.target.value.replace(/\D/g, '')
      const formatted = `${value.dialCode} ${formatPhoneNumber(rawNumber)}`
      field.onChange({ ...value, number: rawNumber, formatted })
    },
    [field, value],
  )
  const handleBlur = useCallback(() => {
    if (formatOnBlur && value.number) {
      const formatted = `${value.dialCode} ${formatPhoneNumber(value.number)}`
      field.onChange({ ...value, formatted })
    }
  }, [field, value, formatOnBlur])

  return (
    <div className="flex gap-2">
      {showCountrySelect && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              disabled={disabled ?? false}
              className={cn(
                'w-[110px] shrink-0 justify-between px-3',
                hasError && 'border-destructive',
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder={mergedLabels.searchCountry} />
              <CommandList>
                <CommandEmpty>{mergedLabels.noCountryFound}</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dialCode}`}
                      onSelect={() => handleCountryChange(country)}
                    >
                      <span className="mr-2">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-muted-foreground">
                        {country.dialCode}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      <div className="relative flex-1">
        <Phone className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
        <Input
          type="tel"
          placeholder={placeholder}
          disabled={disabled ?? false}
          value={formatPhoneNumber(value.number)}
          onChange={handleNumberChange}
          onBlur={handleBlur}
          className={cn(
            'bg-background pl-10',
            hasError && 'border-destructive',
            inputClassName,
          )}
        />
      </div>
    </div>
  )
})
