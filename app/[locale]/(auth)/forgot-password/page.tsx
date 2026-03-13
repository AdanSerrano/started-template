import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ForgotPasswordForm } from '@/modules/auth/components'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'

function ForgotPasswordFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.forgotPassword')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgotPassword')

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Suspense fallback={<ForgotPasswordFormSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href={DEFAULT_LOGOUT_REDIRECT}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  )
}
