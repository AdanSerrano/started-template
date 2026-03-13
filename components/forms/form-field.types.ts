'use client'

import type { ReactNode } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import type { LucideIcon } from 'lucide-react'

export interface TooltipConfig {
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined
  align?: 'start' | 'center' | 'end' | undefined
}

export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label?: ReactNode | undefined
  description?: ReactNode | undefined
  placeholder?: string | undefined
  disabled?: boolean | undefined
  className?: string | undefined
  required?: boolean | undefined
  tooltip?: TooltipConfig | string | undefined
}

export interface FormFieldOption<T = string> {
  value: T
  label: string
  description?: string | undefined
  icon?: LucideIcon | undefined
  disabled?: boolean | undefined
}

export interface FormFieldWithIconProps {
  leftIcon?: LucideIcon | undefined
  rightIcon?: LucideIcon | undefined
}

export interface FormFieldWithOptionsProps<T = string> {
  options: FormFieldOption<T>[]
  emptyMessage?: string | undefined
}

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'number'
  | 'password'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

export interface SelectOption {
  value: string
  label: string
  description?: string | undefined
  icon?: LucideIcon | undefined
  disabled?: boolean | undefined
}

export interface GroupedSelectOption {
  label: string
  options: SelectOption[]
}

export type SelectOptions = SelectOption[] | GroupedSelectOption[]

export function isGroupedOptions(
  options: SelectOptions,
): options is GroupedSelectOption[] {
  return (
    options.length > 0 &&
    'options' in options[0]! &&
    Array.isArray((options[0]! as GroupedSelectOption).options)
  )
}

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

export interface TimeValue {
  hours: number
  minutes: number
}

export interface TimeRange {
  from: TimeValue | undefined
  to?: TimeValue | undefined
}

export interface TagOption {
  value: string
  label: string
  color?: string | undefined
}

export interface TreeNode {
  value: string
  label: string
  children?: TreeNode[] | undefined
  disabled?: boolean | undefined
  icon?: LucideIcon | undefined
}

export interface CascadeOption {
  value: string
  label: string
  children?: CascadeOption[] | undefined
  disabled?: boolean | undefined
}

export interface DatePreset {
  label: string
  getValue: () => Date | DateRange
}

export interface CurrencyConfig {
  code: string
  symbol: string
  locale: string
  decimals?: number | undefined
}

export const DEFAULT_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', locale: 'es-MX', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', decimals: 0 },
}

export interface FileWithPreview extends File {
  preview?: string | undefined
}

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordRequirement {
  label: string
  met: boolean
}

export function calculatePasswordStrength(password: string): {
  level: PasswordStrengthLevel
  requirements: PasswordRequirement[]
} {
  const requirements: PasswordRequirement[] = [
    { label: 'minChars', met: password.length >= 8 },
    { label: 'uppercase', met: /[A-Z]/.test(password) },
    { label: 'lowercase', met: /[a-z]/.test(password) },
    { label: 'number', met: /[0-9]/.test(password) },
    { label: 'specialChar', met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = requirements.filter((r) => r.met).length
  const level = Math.min(4, metCount) as PasswordStrengthLevel

  return { level, requirements }
}
