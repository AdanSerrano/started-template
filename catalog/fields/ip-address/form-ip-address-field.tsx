'use client'

import { Network, Check, X } from 'lucide-react'
import { memo, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  DEFAULT_IP_MESSAGES,
  getPlaceholder,
  validateIP,
  type IPVersion,
} from './form-ip-address-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { IPVersion } from './form-ip-address-field.utils'

export interface FormIPAddressFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  version?: IPVersion | undefined
  allowCIDR?: boolean | undefined
  showValidation?: boolean | undefined
  messages?: Partial<typeof DEFAULT_IP_MESSAGES> | undefined
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
