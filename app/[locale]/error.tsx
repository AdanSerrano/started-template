'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">500</h1>
      <p className="text-muted-foreground mt-4 text-lg">{t('serverError')}</p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium transition-colors"
        >
          {t('tryAgain')}
        </button>
        <Link
          href="/"
          className="border-input bg-background hover:bg-accent inline-flex items-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}
