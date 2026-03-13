import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { geistSans, geistMono } from '@/lib/fonts'
import { routing } from '@/i18n/routing'
import { Toaster } from '@/components/ui/sonner'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    applicationName: 'Starter App',
    generator: 'Next.js',
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'ca' ? 'ca_ES' : 'es_ES',
      alternateLocale: ['es_ES', 'en_US', 'ca_ES'].filter(
        (l) =>
          l !==
          (locale === 'en' ? 'en_US' : locale === 'ca' ? 'ca_ES' : 'es_ES'),
      ),
      siteName: 'Starter App',
      title: t('title'),
      description: t('description'),
      url: locale === 'es' ? BASE_URL : `${BASE_URL}/${locale}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        {
          url: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    alternates: {
      canonical: locale === 'es' ? BASE_URL : `${BASE_URL}/${locale}`,
      languages: {
        'es-ES': BASE_URL,
        'en-US': `${BASE_URL}/en`,
        ca: `${BASE_URL}/ca`,
        'x-default': BASE_URL,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden font-sans antialiased`}
      >
        <a
          href="#main"
          className="bg-primary fixed top-0 left-1/2 z-100 -translate-x-1/2 -translate-y-full rounded-b-md px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
        >
          {tCommon('skipToContent')}
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
