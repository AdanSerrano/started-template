import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function generateMetadata() {
  const t = await getTranslations('errors')
  return {
    title: `404 — ${t('notFoundTitle')}`,
    robots: { index: false, follow: false },
  }
}

export default async function NotFound() {
  const t = await getTranslations('errors')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground mt-4 text-lg">{t('notFound')}</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium transition-colors"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
