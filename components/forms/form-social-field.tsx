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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export type SocialPlatform =
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'github'
  | 'discord'
  | 'twitch'
  | 'telegram'
  | 'whatsapp'
  | 'custom'

export interface SocialValue {
  platform: SocialPlatform
  handle: string
}

interface PlatformConfig {
  name: string
  prefix: string
  baseUrl: string
  placeholder: string
  color: string
  pattern?: RegExp | undefined
}

const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    name: 'X (Twitter)',
    prefix: '@',
    baseUrl: 'https://twitter.com/',
    placeholder: 'username',
    color: 'bg-black',
    pattern: /^[A-Za-z0-9_]{1,15}$/,
  },
  instagram: {
    name: 'Instagram',
    prefix: '@',
    baseUrl: 'https://instagram.com/',
    placeholder: 'username',
    color: 'bg-linear-to-r from-purple-500 to-pink-500',
    pattern: /^[A-Za-z0-9_.]{1,30}$/,
  },
  facebook: {
    name: 'Facebook',
    prefix: '',
    baseUrl: 'https://facebook.com/',
    placeholder: 'username or page',
    color: 'bg-blue-600',
  },
  linkedin: {
    name: 'LinkedIn',
    prefix: '',
    baseUrl: 'https://linkedin.com/in/',
    placeholder: 'username',
    color: 'bg-blue-700',
  },
  youtube: {
    name: 'YouTube',
    prefix: '@',
    baseUrl: 'https://youtube.com/@',
    placeholder: 'channel',
    color: 'bg-red-600',
  },
  tiktok: {
    name: 'TikTok',
    prefix: '@',
    baseUrl: 'https://tiktok.com/@',
    placeholder: 'username',
    color: 'bg-black',
  },
  github: {
    name: 'GitHub',
    prefix: '',
    baseUrl: 'https://github.com/',
    placeholder: 'username',
    color: 'bg-gray-900',
    pattern: /^[A-Za-z0-9-]{1,39}$/,
  },
  discord: {
    name: 'Discord',
    prefix: '',
    baseUrl: '',
    placeholder: 'username#0000 or server invite',
    color: 'bg-indigo-600',
  },
  twitch: {
    name: 'Twitch',
    prefix: '',
    baseUrl: 'https://twitch.tv/',
    placeholder: 'username',
    color: 'bg-purple-600',
  },
  telegram: {
    name: 'Telegram',
    prefix: '@',
    baseUrl: 'https://t.me/',
    placeholder: 'username',
    color: 'bg-blue-500',
  },
  whatsapp: {
    name: 'WhatsApp',
    prefix: '+',
    baseUrl: 'https://wa.me/',
    placeholder: 'phone number',
    color: 'bg-green-500',
  },
  custom: {
    name: 'Custom',
    prefix: '',
    baseUrl: '',
    placeholder: 'URL or handle',
    color: 'bg-gray-500',
  },
}

export interface FormSocialFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  platforms?: SocialPlatform[] | undefined
  defaultPlatform?: SocialPlatform | undefined
  showPlatformSelector?: boolean | undefined
  showOpenLink?: boolean | undefined
}

const PlatformIcon = memo(function PlatformIcon({
  platform,
}: {
  platform: SocialPlatform
}) {
  const config = PLATFORM_CONFIGS[platform]
  return (
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white',
        config.color,
      )}
    >
      {config.name.charAt(0)}
    </div>
  )
})

interface SocialContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  platforms: SocialPlatform[]
  defaultPlatform: SocialPlatform
  showPlatformSelector: boolean
  showOpenLink: boolean
}

const SocialContent = memo(function SocialContent({
  field,
  hasError,
  disabled,
  platforms,
  defaultPlatform,
  showPlatformSelector,
  showOpenLink,
}: SocialContentProps) {
  const value = useMemo(
    () =>
      (field.value || {
        platform: defaultPlatform,
        handle: '',
      }) as SocialValue,
    [field.value, defaultPlatform],
  )

  const config = PLATFORM_CONFIGS[value.platform]

  const profileUrl = useMemo(() => {
    if (!config.baseUrl || !value.handle) return null
    let cleanHandle = value.handle
    if (config.prefix && value.handle.startsWith(config.prefix)) {
      cleanHandle = value.handle.slice(config.prefix.length)
    }
    return `${config.baseUrl}${cleanHandle}`
  }, [config.baseUrl, config.prefix, value.handle])

  const handlePlatformChange = useCallback(
    (platform: string) => {
      field.onChange({ ...value, platform: platform as SocialPlatform })
    },
    [field, value],
  )

  const handleHandleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newHandle = e.target.value
      const platformConfig = PLATFORM_CONFIGS[value.platform]
      if (
        platformConfig.prefix &&
        newHandle.startsWith(platformConfig.prefix)
      ) {
        newHandle = newHandle.slice(platformConfig.prefix.length)
      }
      field.onChange({ ...value, handle: newHandle })
    },
    [field, value],
  )

  const handleOpenProfile = useCallback(() => {
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer')
    }
  }, [profileUrl])

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background',
        config.prefix && 'pl-9',
        hasError && 'border-destructive',
      ),
    [config.prefix, hasError],
  )

  return (
    <div className="flex gap-2">
      {showPlatformSelector && (
        <Select
          value={value.platform}
          onValueChange={handlePlatformChange}
          disabled={disabled ?? false}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <PlatformIcon platform={value.platform} />
                <span className="truncate">{config.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => {
              const pConfig = PLATFORM_CONFIGS[platform]
              return (
                <SelectItem key={platform} value={platform}>
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={platform} />
                    <span>{pConfig.name}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )}

      <div className="relative flex-1">
        {config.prefix && (
          <div className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
            {config.prefix === '@' ? (
              <AtSign className="h-4 w-4" />
            ) : (
              <span className="text-sm">{config.prefix}</span>
            )}
          </div>
        )}
        <Input
          value={value.handle}
          onChange={handleHandleChange}
          placeholder={config.placeholder}
          disabled={disabled ?? false}
          className={inputClasses}
        />
      </div>

      {showOpenLink && profileUrl && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleOpenProfile}
          disabled={disabled || !value.handle}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
})

function FormSocialFieldComponent<
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
  platforms = ['twitter', 'instagram', 'linkedin', 'github', 'youtube'],
  defaultPlatform = 'twitter',
  showPlatformSelector = true,
  showOpenLink = true,
}: FormSocialFieldProps<TFieldValues, TName>) {
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
            <SocialContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              platforms={platforms}
              defaultPlatform={defaultPlatform}
              showPlatformSelector={showPlatformSelector}
              showOpenLink={showOpenLink}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormSocialField = memo(
  FormSocialFieldComponent,
) as typeof FormSocialFieldComponent
