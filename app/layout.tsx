import { viewportTheme } from '@/lib/theme'
import type { Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: viewportTheme.light },
    { media: '(prefers-color-scheme: dark)', color: viewportTheme.dark },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
