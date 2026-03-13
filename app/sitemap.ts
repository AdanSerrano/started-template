import type { MetadataRoute } from 'next'

const locales = ['es', 'en', 'ca'] as const
const defaultLocale = 'es'

function getLocalizedUrl(
  baseUrl: string,
  path: string,
  locale: string,
): string {
  if (locale === defaultLocale) return `${baseUrl}${path}`
  return `${baseUrl}/${locale}${path}`
}

function buildAlternates(baseUrl: string, path: string) {
  return {
    languages: {
      ...Object.fromEntries(
        locales.map((l) => [
          l === 'es' ? 'es-ES' : l === 'ca' ? 'ca' : 'en-US',
          getLocalizedUrl(baseUrl, path, l),
        ]),
      ),
      'x-default': getLocalizedUrl(baseUrl, path, defaultLocale),
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const now = new Date()

  const staticPages: {
    path: string
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }[] = [
    { path: '', changeFrequency: 'weekly', priority: 1.0 },
  ]

  return staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(baseUrl, page.path, locale),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: buildAlternates(baseUrl, page.path),
    })),
  )
}
