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

export interface PlatformConfig {
  name: string
  prefix: string
  baseUrl: string
  placeholder: string
  color: string
  pattern?: RegExp | undefined
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
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
