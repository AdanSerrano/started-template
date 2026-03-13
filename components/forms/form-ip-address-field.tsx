'use client'

import { memo, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Network, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export type IPVersion = 'ipv4' | 'ipv6' | 'both'

export interface FormIPAddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  version?: IPVersion | undefined
  allowCIDR?: boolean | undefined
  showValidation?: boolean | undefined
}

interface IPValidation {
  valid: boolean
  version?: 'IPv4' | 'IPv6' | undefined
  cidr?: number | undefined
  error?: string | undefined
}

function validateIPv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false

  return parts.every((part) => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString()
  })
}

function validateIPv6(ip: string): boolean {
  const parts = ip.split(':')

  if (parts.length > 8) return false

  const hasDoubleColon = ip.includes('::')
  if (hasDoubleColon) {
    const doubleColonCount = (ip.match(/::/g) || []).length
    if (doubleColonCount > 1) return false
  } else if (parts.length !== 8) {
    return false
  }

  return parts.every((part) => {
    if (part === '') return hasDoubleColon
    return /^[0-9a-fA-F]{1,4}$/.test(part)
  })
}

function validateIP(
  value: string,
  allowedVersions: IPVersion,
  allowCIDR: boolean,
): IPValidation {
  if (!value || !value.trim()) {
    return { valid: false }
  }

  let ip = value.trim()
  let cidr: number | undefined

  if (ip.includes('/')) {
    if (!allowCIDR) {
      return { valid: false, error: 'CIDR notation not allowed' }
    }
    const parts = ip.split('/')
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid CIDR notation' }
    }
    ip = parts[0]!
    cidr = parseInt(parts[1]!, 10)
    if (isNaN(cidr) || cidr < 0) {
      return { valid: false, error: 'Invalid CIDR prefix' }
    }
  }

  const isIPv4 = validateIPv4(ip)
  const isIPv6 = !isIPv4 && validateIPv6(ip)

  if (isIPv4) {
    if (allowedVersions === 'ipv6') {
      return { valid: false, error: 'IPv6 only' }
    }
    if (cidr !== undefined && cidr > 32) {
      return { valid: false, error: 'IPv4 CIDR must be 0-32' }
    }
    return { valid: true, version: 'IPv4', cidr }
  }

  if (isIPv6) {
    if (allowedVersions === 'ipv4') {
      return { valid: false, error: 'IPv4 only' }
    }
    if (cidr !== undefined && cidr > 128) {
      return { valid: false, error: 'IPv6 CIDR must be 0-128' }
    }
    return { valid: true, version: 'IPv6', cidr }
  }

  return { valid: false, error: 'Invalid IP address' }
}

function getPlaceholder(version: IPVersion, allowCIDR: boolean): string {
  const examples: Record<IPVersion, string> = {
    ipv4: allowCIDR ? '192.168.1.0/24' : '192.168.1.1',
    ipv6: allowCIDR ? '2001:db8::/32' : '2001:db8::1',
    both: allowCIDR ? '192.168.1.0/24 or 2001:db8::/32' : '192.168.1.1',
  }
  return examples[version]
}

interface IPContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  version: IPVersion
  allowCIDR: boolean
  showValidation: boolean
}

const IPContent = memo(function IPContent({
  field,
  hasError,
  disabled,
  placeholder,
  version,
  allowCIDR,
  showValidation,
}: IPContentProps) {
  const validation = useMemo(
    () => validateIP(field.value || '', version, allowCIDR),
    [field.value, version, allowCIDR],
  )

  const inputClasses = useMemo(
    () => cn('bg-background pl-10 font-mono', hasError && 'border-destructive'),
    [hasError],
  )

  const badgeClasses = useMemo(
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
        <Network className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
        <Input
          {...field}
          value={field.value ?? ''}
          placeholder={placeholder}
          disabled={disabled ?? false}
          className={inputClasses}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {showValidation && field.value && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={badgeClasses}>
            {validation.valid ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Valid
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                {validation.error || 'Invalid'}
              </>
            )}
          </Badge>
          {validation.version && (
            <Badge variant="secondary" className="text-xs">
              {validation.version}
            </Badge>
          )}
          {validation.cidr !== undefined && (
            <Badge variant="secondary" className="text-xs">
              /{validation.cidr}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
})

function FormIPAddressFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  required,
  version = 'both',
  allowCIDR = false,
  showValidation = true,
}: FormIPAddressFieldProps<TFieldValues, TName>) {
  const defaultPlaceholder = useMemo(
    () => placeholder || getPlaceholder(version, allowCIDR),
    [placeholder, version, allowCIDR],
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
            <IPContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={defaultPlaceholder}
              version={version}
              allowCIDR={allowCIDR}
              showValidation={showValidation}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormIPAddressField = memo(
  FormIPAddressFieldComponent,
) as typeof FormIPAddressFieldComponent
