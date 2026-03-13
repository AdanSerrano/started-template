import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const authPaths = [
    '/login/',
    '/register/',
    '/en/login/',
    '/en/register/',
    '/forgot-password/',
    '/en/forgot-password/',
    '/reset-password/',
    '/en/reset-password/',
    '/verify-email/',
    '/en/verify-email/',
  ]

  const privatePaths = ['/api/', '/account/', '/en/account/']

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
