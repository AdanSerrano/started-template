import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { RegisterForm } from '@/modules/auth/components'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register')

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>

      <p className="text-muted-foreground text-center text-sm">
        {t('hasAccount')}{' '}
        <Link
          href={DEFAULT_LOGOUT_REDIRECT}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {t('loginLink')}
        </Link>
      </p>
    </div>
  )
}
