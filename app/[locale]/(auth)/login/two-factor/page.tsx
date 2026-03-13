import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TwoFactorVerifyForm } from '@/modules/auth/components/two-factor-verify-form.client'
import { Skeleton } from '@/components/ui/skeleton'

function TwoFactorFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="size-12" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.twoFactor')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function TwoFactorPage() {
  const t = await getTranslations('auth.twoFactor')

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Suspense fallback={<TwoFactorFormSkeleton />}>
        <TwoFactorVerifyForm />
      </Suspense>
    </div>
  )
}
