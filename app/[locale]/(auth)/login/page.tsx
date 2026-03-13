import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/modules/auth/components'
import { Skeleton } from '@/components/ui/skeleton'

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login')

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>

      <p className="text-muted-foreground text-center text-sm">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {t('registerLink')}
        </Link>
      </p>
    </div>
  )
}
