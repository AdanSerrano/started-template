'use client'

import { memo, useCallback, useMemo } from 'react'
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
import { Landmark, Check, X, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormIBANFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  showValidation?: boolean | undefined
  showCountry?: boolean | undefined
  showCopy?: boolean | undefined
}

const IBAN_LENGTHS: Record<string, number> = {
  AL: 28,
  AD: 24,
  AT: 20,
  AZ: 28,
  BH: 22,
  BY: 28,
  BE: 16,
  BA: 20,
  BR: 29,
  BG: 22,
  CR: 22,
  HR: 21,
  CY: 28,
  CZ: 24,
  DK: 18,
  DO: 28,
  TL: 23,
  EE: 20,
  FO: 18,
  FI: 18,
  FR: 27,
  GE: 22,
  DE: 22,
  GI: 23,
  GR: 27,
  GL: 18,
  GT: 28,
  HU: 28,
  IS: 26,
  IQ: 23,
  IE: 22,
  IL: 23,
  IT: 27,
  JO: 30,
  KZ: 20,
  XK: 20,
  KW: 30,
  LV: 21,
  LB: 28,
  LI: 21,
  LT: 20,
  LU: 20,
  MK: 19,
  MT: 31,
  MR: 27,
  MU: 30,
  MC: 27,
  MD: 24,
  ME: 22,
  NL: 18,
  NO: 15,
  PK: 24,
  PS: 29,
  PL: 28,
  PT: 25,
  QA: 29,
  RO: 24,
  SM: 27,
  SA: 24,
  RS: 22,
  SC: 31,
  SK: 24,
  SI: 19,
  ES: 24,
  SE: 24,
  CH: 21,
  TN: 24,
  TR: 26,
  UA: 29,
  AE: 23,
  GB: 22,
  VG: 24,
}

const COUNTRY_NAMES: Record<string, string> = {
  AL: 'Albania',
  AD: 'Andorra',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BH: 'Bahrain',
  BY: 'Belarus',
  BE: 'Belgium',
  BA: 'Bosnia',
  BR: 'Brazil',
  BG: 'Bulgaria',
  CR: 'Costa Rica',
  HR: 'Croatia',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DO: 'Dominican Republic',
  TL: 'East Timor',
  EE: 'Estonia',
  FO: 'Faroe Islands',
  FI: 'Finland',
  FR: 'France',
  GE: 'Georgia',
  DE: 'Germany',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GT: 'Guatemala',
  HU: 'Hungary',
  IS: 'Iceland',
  IQ: 'Iraq',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  XK: 'Kosovo',
  KW: 'Kuwait',
  LV: 'Latvia',
  LB: 'Lebanon',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MK: 'Macedonia',
  MT: 'Malta',
  MR: 'Mauritania',
  MU: 'Mauritius',
  MC: 'Monaco',
  MD: 'Moldova',
  ME: 'Montenegro',
  NL: 'Netherlands',
  NO: 'Norway',
  PK: 'Pakistan',
  PS: 'Palestine',
  PL: 'Poland',
  PT: 'Portugal',
  QA: 'Qatar',
  RO: 'Romania',
  SM: 'San Marino',
  SA: 'Saudi Arabia',
  RS: 'Serbia',
  SC: 'Seychelles',
  SK: 'Slovakia',
  SI: 'Slovenia',
  ES: 'Spain',
  SE: 'Sweden',
  CH: 'Switzerland',
  TN: 'Tunisia',
  TR: 'Turkey',
  UA: 'Ukraine',
  AE: 'UAE',
  GB: 'United Kingdom',
  VG: 'British Virgin Islands',
}

function formatIBAN(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

function getCountryCode(iban: string): string {
  const cleaned = iban.replace(/\s/g, '')
  return cleaned.slice(0, 2).toUpperCase()
}

function validateIBAN(iban: string): {
  valid: boolean
  error?: string | undefined
} {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()

  if (cleaned.length < 2) {
    return { valid: false }
  }

  const countryCode = cleaned.slice(0, 2)

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { valid: false, error: 'Invalid country code' }
  }

  const expectedLength = IBAN_LENGTHS[countryCode]
  if (!expectedLength) {
    return { valid: false, error: 'Unknown country code' }
  }

  if (cleaned.length !== expectedLength) {
    return { valid: false, error: `Expected ${expectedLength} characters` }
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numericIBAN = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      return code >= 65 && code <= 90 ? (code - 55).toString() : char
    })
    .join('')

  let remainder = numericIBAN
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9)
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9)
  }

  if (parseInt(remainder, 10) % 97 !== 1) {
    return { valid: false, error: 'Invalid checksum' }
  }

  return { valid: true }
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
}

const IBANContent = memo(function IBANContent({
  field,
  hasError,
  disabled,
  placeholder,
  showValidation,
  showCountry,
  showCopy,
}: IBANContentProps) {
  const validation = useMemo(
    () => validateIBAN(field.value || ''),
    [field.value],
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
                  Valid IBAN
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  {validation.error || 'Invalid'}
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
}: FormIBANFieldProps<TFieldValues, TName>) {
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
