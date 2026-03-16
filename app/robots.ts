import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const authPaths = [
    '/login/',
    '/register/',
    '/forgot-password/',
    '/reset-password/',
    '/verify-email/',
    '/en/login/',
    '/en/register/',
    '/en/forgot-password/',
    '/en/reset-password/',
    '/en/verify-email/',
    '/ca/login/',
    '/ca/register/',
    '/ca/forgot-password/',
    '/ca/reset-password/',
    '/ca/verify-email/',
  ]

  const privatePaths = ['/api/', '/account/', '/en/account/', '/ca/account/']

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/'],
        disallow: ['/_next/image/', ...privatePaths, ...authPaths],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
