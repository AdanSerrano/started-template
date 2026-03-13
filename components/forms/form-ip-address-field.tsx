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

const DEFAULT_IP_MESSAGES = {
  cidrNotAllowed: 'CIDR notation not allowed',
  invalidCidr: 'Invalid CIDR notation',
  invalidCidrPrefix: 'Invalid CIDR prefix',
  ipv6Only: 'IPv6 only',
  ipv4CidrRange: 'IPv4 CIDR must be 0-32',
  ipv4Only: 'IPv4 only',
  ipv6CidrRange: 'IPv6 CIDR must be 0-128',
  invalidIp: 'Invalid IP address',
  valid: 'Valid',
  invalid: 'Invalid',
}

export interface FormIPAddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  version?: IPVersion | undefined
  allowCIDR?: boolean | undefined
  showValidation?: boolean | undefined
  messages?: Partial<typeof DEFAULT_IP_MESSAGES> | undefined
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
  messages: typeof DEFAULT_IP_MESSAGES,
): IPValidation {
  if (!value || !value.trim()) {
    return { valid: false }
  }

  let ip = value.trim()
  let cidr: number | undefined

  if (ip.includes('/')) {
    if (!allowCIDR) {
      return { valid: false, error: messages.cidrNotAllowed }
    }
    const parts = ip.split('/')
    if (parts.length !== 2) {
      return { valid: false, error: messages.invalidCidr }
    }
    ip = parts[0]!
    cidr = parseInt(parts[1]!, 10)
    if (isNaN(cidr) || cidr < 0) {
      return { valid: false, error: messages.invalidCidrPrefix }
    }
  }

  const isIPv4 = validateIPv4(ip)
  const isIPv6 = !isIPv4 && validateIPv6(ip)

  if (isIPv4) {
    if (allowedVersions === 'ipv6') {
      return { valid: false, error: messages.ipv6Only }
    }
    if (cidr !== undefined && cidr > 32) {
      return { valid: false, error: messages.ipv4CidrRange }
    }
    return { valid: true, version: 'IPv4', cidr }
  }

  if (isIPv6) {
    if (allowedVersions === 'ipv4') {
      return { valid: false, error: messages.ipv4Only }
    }
    if (cidr !== undefined && cidr > 128) {
      return { valid: false, error: messages.ipv6CidrRange }
    }
    return { valid: true, version: 'IPv6', cidr }
  }

  return { valid: false, error: messages.invalidIp }
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
  messages: typeof DEFAULT_IP_MESSAGES
}

const IPContent = memo(function IPContent({
  field,
  hasError,
  disabled,
  placeholder,
  version,
  allowCIDR,
  showValidation,
  messages,
}: IPContentProps) {
  const validation = useMemo(
    () => validateIP(field.value || '', version, allowCIDR, messages),
    [field.value, version, allowCIDR, messages],
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
                {messages.valid}
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                {validation.error || messages.invalid}
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
  messages: customMessages,
}: FormIPAddressFieldProps<TFieldValues, TName>) {
  const messages = useMemo(
    () =>
      ({
        ...DEFAULT_IP_MESSAGES,
        ...customMessages,
      }) as typeof DEFAULT_IP_MESSAGES,
    [customMessages],
  )

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
              messages={messages}
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
