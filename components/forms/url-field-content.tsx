'use client'

import { Link2, ExternalLink, Check, X, Copy, Globe } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  type DEFAULT_URL_MESSAGES,
  validateUrl,
  getFaviconUrl,
  hasProtocol,
  UrlValidation,
} from './form-url-field.utils'

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

export interface UrlContentProps {
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
  messages: typeof DEFAULT_URL_MESSAGES
}

export const UrlContent = memo(function UrlContent({
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
  messages,
}: UrlContentProps) {
  const validation = useMemo(
    () => validateUrl(field.value || '', allowedProtocols, messages),
    [field.value, allowedProtocols, messages],
  )
  const faviconUrl = useMemo(
    () =>
      showFavicon && validation.valid ? getFaviconUrl(field.value || '') : null,
    [field.value, validation.valid, showFavicon],
  )
  const handleBlur = useCallback(() => {
    field.onBlur()
    if (autoAddProtocol && field.value && !hasProtocol(field.value)) {
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
    if (autoAddProtocol && !hasProtocol(field.value)) {
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
                  {messages.validUrl}
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  {validation.error || messages.invalid}
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
