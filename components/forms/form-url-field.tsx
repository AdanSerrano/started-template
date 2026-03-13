'use client'

import { memo, useMemo, useCallback } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link2, ExternalLink, Check, X, Copy, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormUrlFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  showValidation?: boolean | undefined
  showOpenLink?: boolean | undefined
  showCopy?: boolean | undefined
  showFavicon?: boolean | undefined
  allowedProtocols?: string[] | undefined
  autoAddProtocol?: boolean | undefined
}

interface UrlValidation {
  valid: boolean
  protocol?: string | undefined
  hostname?: string | undefined
  error?: string | undefined
}

function validateUrl(url: string, allowedProtocols: string[]): UrlValidation {
  if (!url || !url.trim()) {
    return { valid: false }
  }

  try {
    let urlToValidate = url
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      urlToValidate = `https://${url}`
    }

    const parsed = new URL(urlToValidate)
    const protocol = parsed.protocol.replace(':', '')

    if (!allowedProtocols.includes(protocol)) {
      return {
        valid: false,
        protocol,
        error: `Protocol "${protocol}" not allowed`,
      }
    }

    return {
      valid: true,
      protocol,
      hostname: parsed.hostname,
    }
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    }
  }
}

function getFaviconUrl(url: string): string | null {
  try {
    let urlToValidate = url
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      urlToValidate = `https://${url}`
    }
    const parsed = new URL(urlToValidate)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`
  } catch {
    return null
  }
}

const UrlPreview = memo(function UrlPreview({
  validation,
  faviconUrl,
  showFavicon,
}: {
  validation: UrlValidation
  faviconUrl: string | null
  showFavicon: boolean
}) {
  if (!validation.valid || !validation.hostname) return null

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      {showFavicon && faviconUrl && (
        /* eslint-disable-next-line @next/next/no-img-element -- Dynamic external favicon URL */
        <img
          src={faviconUrl}
          alt=""
          className="h-4 w-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <Globe className="h-3 w-3" />
      <span className="truncate">{validation.hostname}</span>
    </div>
  )
})

interface UrlContentProps {
  field: {
    value: string | undefined
    onChange: (value: string) => void
    onBlur: () => void
  }
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  showValidation: boolean
  showOpenLink: boolean
  showCopy: boolean
  showFavicon: boolean
  allowedProtocols: string[]
  autoAddProtocol: boolean
}

const UrlContent = memo(function UrlContent({
  field,
  hasError,
  disabled,
  placeholder,
  showValidation,
  showOpenLink,
  showCopy,
  showFavicon,
  allowedProtocols,
  autoAddProtocol,
}: UrlContentProps) {
  const validation = useMemo(
    () => validateUrl(field.value || '', allowedProtocols),
    [field.value, allowedProtocols],
  )

  const faviconUrl = useMemo(
    () =>
      showFavicon && validation.valid ? getFaviconUrl(field.value || '') : null,
    [field.value, validation.valid, showFavicon],
  )

  const handleBlur = useCallback(() => {
    field.onBlur()
    if (
      autoAddProtocol &&
      field.value &&
      !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(field.value)
    ) {
      field.onChange(`https://${field.value}`)
    }
  }, [field, autoAddProtocol])

  const handleCopy = useCallback(() => {
    if (field.value) {
      navigator.clipboard.writeText(field.value)
    }
  }, [field.value])

  const handleOpen = useCallback(() => {
    if (!field.value) return
    let urlToOpen = field.value
    if (autoAddProtocol && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(field.value)) {
      urlToOpen = `https://${field.value}`
    }
    window.open(urlToOpen, '_blank', 'noopener,noreferrer')
  }, [field.value, autoAddProtocol])

  const inputClasses = useMemo(
    () => cn('bg-background pl-10', hasError && 'border-destructive'),
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
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Link2 className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
          <Input
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled ?? false}
            className={inputClasses}
            type="url"
          />
        </div>
        {(showOpenLink || showCopy) && field.value && validation.valid && (
          <div className="flex gap-1">
            {showCopy && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={disabled ?? false}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {showOpenLink && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleOpen}
                disabled={disabled ?? false}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {field.value && (
        <div className="flex flex-wrap items-center gap-2">
          {showValidation && (
            <Badge variant="outline" className={validationBadgeClasses}>
              {validation.valid ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Valid URL
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  {validation.error || 'Invalid'}
                </>
              )}
            </Badge>
          )}
          <UrlPreview
            validation={validation}
            faviconUrl={faviconUrl}
            showFavicon={showFavicon}
          />
        </div>
      )}
    </div>
  )
})

function FormUrlFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'https://example.com',
  disabled,
  className,
  required,
  showValidation = true,
  showOpenLink = true,
  showCopy = true,
  showFavicon = true,
  allowedProtocols = ['http', 'https'],
  autoAddProtocol = true,
}: FormUrlFieldProps<TFieldValues, TName>) {
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
            <UrlContent
              field={field}
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              showValidation={showValidation}
              showOpenLink={showOpenLink}
              showCopy={showCopy}
              showFavicon={showFavicon}
              allowedProtocols={allowedProtocols}
              autoAddProtocol={autoAddProtocol}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormUrlField = memo(
  FormUrlFieldComponent,
) as typeof FormUrlFieldComponent
