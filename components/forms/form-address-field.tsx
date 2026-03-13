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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, Building2, Home, Hash, Globe, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface AddressValue {
  street?: string | undefined
  number?: string | undefined
  apartment?: string | undefined
  city?: string | undefined
  state?: string | undefined
  postalCode?: string | undefined
  country?: string | undefined
}

export interface FormAddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showApartment?: boolean | undefined
  showState?: boolean | undefined
  countries?: { value: string; label: string }[] | undefined
  states?: { value: string; label: string; country?: string }[] | undefined
  layout?: 'stacked' | 'inline' | undefined
  labels?: Partial<typeof DEFAULT_LABELS> | undefined
  placeholders?: Partial<typeof DEFAULT_PLACEHOLDERS> | undefined
}

const DEFAULT_LABELS = {
  street: 'Street',
  number: 'Number',
  apartment: 'Apt/Suite',
  city: 'City',
  state: 'State/Province',
  postalCode: 'Postal Code',
  country: 'Country',
}

const DEFAULT_PLACEHOLDERS = {
  street: '123 Main Street',
  number: '123',
  apartment: 'Apt 4B',
  city: 'New York',
  state: 'Select state',
  postalCode: '10001',
  country: 'Select country',
}

const DEFAULT_COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'BR', label: 'Brazil' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
]

interface AddressInputProps {
  icon: React.ElementType
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  disabled?: boolean | undefined
  className?: string | undefined
  error?: boolean | undefined
}

const AddressInput = memo(function AddressInput({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
  disabled,
  className,
  error,
}: AddressInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  const inputClasses = useMemo(
    () => cn('bg-background', error && 'border-destructive'),
    [error],
  )

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled ?? false}
        className={inputClasses}
      />
    </div>
  )
})

interface AddressSelectProps {
  icon: React.ElementType
  label: string
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean | undefined
  className?: string | undefined
  error?: boolean | undefined
}

const AddressSelect = memo(function AddressSelect({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
  className,
  error,
}: AddressSelectProps) {
  const triggerClasses = useMemo(
    () => cn('bg-background', error && 'border-destructive'),
    [error],
  )

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled ?? false}
      >
        <SelectTrigger className={triggerClasses}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

interface AddressContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showApartment: boolean
  showState: boolean
  countries: { value: string; label: string }[]
  states: { value: string; label: string; country?: string }[]
  layout: 'stacked' | 'inline'
  labels: typeof DEFAULT_LABELS
  placeholders: typeof DEFAULT_PLACEHOLDERS
}

const AddressContent = memo(function AddressContent({
  field,
  hasError,
  disabled,
  showApartment,
  showState,
  countries,
  states,
  layout,
  labels,
  placeholders,
}: AddressContentProps) {
  const value = useMemo(
    () => (field.value || {}) as AddressValue,
    [field.value],
  )

  const filteredStates = useMemo(
    () =>
      value.country
        ? states.filter((s) => !s.country || s.country === value.country)
        : states,
    [value.country, states],
  )

  const handleStreetChange = useCallback(
    (v: string) => field.onChange({ ...value, street: v }),
    [field, value],
  )

  const handleNumberChange = useCallback(
    (v: string) => field.onChange({ ...value, number: v }),
    [field, value],
  )

  const handleApartmentChange = useCallback(
    (v: string) => field.onChange({ ...value, apartment: v }),
    [field, value],
  )

  const handleCityChange = useCallback(
    (v: string) => field.onChange({ ...value, city: v }),
    [field, value],
  )

  const handleStateChange = useCallback(
    (v: string) => field.onChange({ ...value, state: v }),
    [field, value],
  )

  const handlePostalCodeChange = useCallback(
    (v: string) => field.onChange({ ...value, postalCode: v }),
    [field, value],
  )

  const handleCountryChange = useCallback(
    (v: string) => field.onChange({ ...value, country: v }),
    [field, value],
  )

  if (layout === 'inline') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AddressInput
          icon={Home}
          label={labels.street}
          value={value.street || ''}
          placeholder={placeholders.street}
          onChange={handleStreetChange}
          disabled={disabled ?? false}
          className="col-span-2"
          error={hasError}
        />
        <AddressInput
          icon={Hash}
          label={labels.number}
          value={value.number || ''}
          placeholder={placeholders.number}
          onChange={handleNumberChange}
          disabled={disabled ?? false}
          error={hasError}
        />
        {showApartment && (
          <AddressInput
            icon={Building2}
            label={labels.apartment}
            value={value.apartment || ''}
            placeholder={placeholders.apartment}
            onChange={handleApartmentChange}
            disabled={disabled ?? false}
            error={hasError}
          />
        )}
        <AddressInput
          icon={MapPin}
          label={labels.city}
          value={value.city || ''}
          placeholder={placeholders.city}
          onChange={handleCityChange}
          disabled={disabled ?? false}
          error={hasError}
        />
        {showState && (
          <AddressInput
            icon={Map}
            label={labels.state}
            value={value.state || ''}
            placeholder={placeholders.state}
            onChange={handleStateChange}
            disabled={disabled ?? false}
            error={hasError}
          />
        )}
        <AddressInput
          icon={Hash}
          label={labels.postalCode}
          value={value.postalCode || ''}
          placeholder={placeholders.postalCode}
          onChange={handlePostalCodeChange}
          disabled={disabled ?? false}
          error={hasError}
        />
        <AddressSelect
          icon={Globe}
          label={labels.country}
          value={value.country || ''}
          placeholder={placeholders.country}
          options={countries}
          onChange={handleCountryChange}
          disabled={disabled ?? false}
          error={hasError}
        />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AddressInput
          icon={Home}
          label={labels.street}
          value={value.street || ''}
          placeholder={placeholders.street}
          onChange={handleStreetChange}
          disabled={disabled ?? false}
          className="sm:col-span-2"
          error={hasError}
        />
        <AddressInput
          icon={Hash}
          label={labels.number}
          value={value.number || ''}
          placeholder={placeholders.number}
          onChange={handleNumberChange}
          disabled={disabled ?? false}
          error={hasError}
        />
      </div>
      {showApartment && (
        <AddressInput
          icon={Building2}
          label={labels.apartment}
          value={value.apartment || ''}
          placeholder={placeholders.apartment}
          onChange={handleApartmentChange}
          disabled={disabled ?? false}
          error={hasError}
        />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AddressInput
          icon={MapPin}
          label={labels.city}
          value={value.city || ''}
          placeholder={placeholders.city}
          onChange={handleCityChange}
          disabled={disabled ?? false}
          error={hasError}
        />
        {showState &&
          (filteredStates.length > 0 ? (
            <AddressSelect
              icon={Map}
              label={labels.state}
              value={value.state || ''}
              placeholder={placeholders.state}
              options={filteredStates}
              onChange={handleStateChange}
              disabled={disabled ?? false}
              error={hasError}
            />
          ) : (
            <AddressInput
              icon={Map}
              label={labels.state}
              value={value.state || ''}
              placeholder={placeholders.state}
              onChange={handleStateChange}
              disabled={disabled ?? false}
              error={hasError}
            />
          ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AddressInput
          icon={Hash}
          label={labels.postalCode}
          value={value.postalCode || ''}
          placeholder={placeholders.postalCode}
          onChange={handlePostalCodeChange}
          disabled={disabled ?? false}
          error={hasError}
        />
        <AddressSelect
          icon={Globe}
          label={labels.country}
          value={value.country || ''}
          placeholder={placeholders.country}
          options={countries}
          onChange={handleCountryChange}
          disabled={disabled ?? false}
          error={hasError}
        />
      </div>
    </>
  )
})

function FormAddressFieldComponent<
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
  showApartment = true,
  showState = true,
  countries = DEFAULT_COUNTRIES,
  states = [],
  layout = 'stacked',
  labels: customLabels,
  placeholders: customPlaceholders,
}: FormAddressFieldProps<TFieldValues, TName>) {
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
            <div
              className={cn(
                'space-y-4 rounded-lg border p-4',
                fieldState.error && 'border-destructive',
              )}
            >
              <AddressContent
                field={
                  field as unknown as ControllerRenderProps<FieldValues, string>
                }
                hasError={!!fieldState.error}
                disabled={disabled ?? false}
                showApartment={showApartment}
                showState={showState}
                countries={countries}
                states={states}
                layout={layout}
                labels={labels}
                placeholders={placeholders}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormAddressField = memo(
  FormAddressFieldComponent,
) as typeof FormAddressFieldComponent
