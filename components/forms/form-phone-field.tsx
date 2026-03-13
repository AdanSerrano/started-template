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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, Phone } from 'lucide-react'
import type { BaseFormFieldProps } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface CountryCode {
  code: string
  dialCode: string
  name: string
  flag: string
}

const DEFAULT_COUNTRIES: CountryCode[] = [
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', dialCode: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'PT', dialCode: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
]

export interface PhoneValue {
  countryCode: string
  dialCode: string
  number: string
  formatted: string
}

export interface FormPhoneFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  countries?: CountryCode[] | undefined
  defaultCountry?: string | undefined
  showCountrySelect?: boolean | undefined
  formatOnBlur?: boolean | undefined
  inputClassName?: string | undefined
  labels?:
    | {
        searchCountry?: string | undefined
        noCountryFound?: string | undefined
      }
    | undefined
}

function formatPhoneNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
}

interface PhoneContentProps {
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

const PhoneContent = memo(function PhoneContent({
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
      field.onChange({
        ...value,
        number: rawNumber,
        formatted,
      })
    },
    [field, value],
  )

  const handleBlur = useCallback(() => {
    if (formatOnBlur && value.number) {
      const formatted = `${value.dialCode} ${formatPhoneNumber(value.number)}`
      field.onChange({
        ...value,
        formatted,
      })
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

function FormPhoneFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = '123 456 7890',
  disabled,
  className,
  required,
  tooltip,
  countries = DEFAULT_COUNTRIES,
  defaultCountry = 'US',
  showCountrySelect = true,
  formatOnBlur = true,
  inputClassName,
  labels,
}: FormPhoneFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () =>
      ({
        searchCountry: 'Search country...',
        noCountryFound: 'No country found',
        ...labels,
      }) as { searchCountry: string; noCountryFound: string },
    [labels],
  )

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
            <PhoneContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              countries={countries}
              defaultCountry={defaultCountry}
              showCountrySelect={showCountrySelect}
              formatOnBlur={formatOnBlur}
              placeholder={placeholder}
              disabled={disabled ?? false}
              hasError={!!fieldState.error}
              inputClassName={inputClassName}
              mergedLabels={mergedLabels}
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

export const FormPhoneField = memo(
  FormPhoneFieldComponent,
) as typeof FormPhoneFieldComponent
