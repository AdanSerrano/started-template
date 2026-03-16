import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import type { BaseFormFieldProps } from '../form-field.types'

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

export const DEFAULT_LABELS = {
  street: 'Street',
  number: 'Number',
  apartment: 'Apt/Suite',
  city: 'City',
  state: 'State/Province',
  postalCode: 'Postal Code',
  country: 'Country',
}

export const DEFAULT_PLACEHOLDERS = {
  street: '123 Main Street',
  number: '123',
  apartment: 'Apt 4B',
  city: 'New York',
  state: 'Select state',
  postalCode: '10001',
  country: 'Select country',
}

export const DEFAULT_COUNTRIES = [
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

export interface AddressInputProps {
  icon: React.ElementType
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  disabled?: boolean | undefined
  className?: string | undefined
  error?: boolean | undefined
}

export interface AddressSelectProps {
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

export interface AddressContentProps {
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
