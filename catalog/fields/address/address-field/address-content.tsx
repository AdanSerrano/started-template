'use client'

import { MapPin, Building2, Home, Hash, Globe, Map } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { AddressInput, AddressSelect } from './address-inputs'
import type { AddressValue, AddressContentProps } from './types'

export const AddressContent = memo(function AddressContent({
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
