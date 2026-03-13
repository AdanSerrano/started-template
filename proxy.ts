import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { getSessionCookie } from 'better-auth/cookies'
import { routing } from '@/i18n/routing'
import {
  authRoutes,
  publicRoutes,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_LOGOUT_REDIRECT,
} from '@/routes'

const intlMiddleware = createIntlMiddleware(routing)

const LOCALE_PATTERN = /^\/(es|en|ca)(?:\/|$)/

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(LOCALE_PATTERN)
  if (!match?.[1]) return pathname
  return pathname.slice(match[1].length + 1) || '/'
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(LOCALE_PATTERN)
  const locale = match?.[1]
  if (!locale) return routing.defaultLocale
  return locale
}

function localizeUrl(url: string, locale: string, request: NextRequest): URL {
  const path = locale === routing.defaultLocale ? url : `/${locale}${url}`
  return new URL(path, request.url)
}

function isPublicRoute(pathname: string): boolean {
  // Check exact match
  if (publicRoutes.includes(pathname)) return true

  // Check if pathname starts with any public route prefix
  return publicRoutes.some(
    (route) => route !== '/' && pathname.startsWith(`${route}/`),
  )
}

function isAuthRoute(pathname: string): boolean {
  // Check exact match
  if (authRoutes.includes(pathname)) return true

  // Check if pathname starts with any auth route prefix
  return authRoutes.some((route) => pathname.startsWith(`${route}/`))
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes entirely — no locale processing
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Server actions use POST with next-action header — never redirect them
  const isServerAction = request.headers.has('next-action')

  // Get locale from request header (set by next-intl) or from path
  const locale = getLocaleFromPath(pathname)
  const realPathname = stripLocalePrefix(pathname)
  const sessionCookie = getSessionCookie(request)

  // Public routes — always allow (landing page, pricing, etc.)
  // Check this FIRST to avoid any auth redirects on public pages
  if (isPublicRoute(realPathname)) {
    return intlMiddleware(request)
  }

  // Auth routes — redirect to dashboard if already authenticated
  // (but never redirect server action requests)
  if (isAuthRoute(realPathname)) {
    if (sessionCookie && !isServerAction) {
      return NextResponse.redirect(
        localizeUrl(DEFAULT_LOGIN_REDIRECT, locale, request),
      )
    }
    return intlMiddleware(request)
  }

  // Protected routes — redirect to login if no session
  if (!sessionCookie) {
    return NextResponse.redirect(
      localizeUrl(DEFAULT_LOGOUT_REDIRECT, locale, request),
    )
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.webp$|sw\\.js|sw\\.js\\.map|swe-worker-.*\\.js|manifest\\.webmanifest).*)',
  ],
}
