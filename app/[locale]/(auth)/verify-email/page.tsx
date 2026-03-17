import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { VerifyEmailStatus } from '@/modules/auth/components'
import type { Metadata } from 'next'

export const revalidate = 3600

function VerifyEmailSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.verifyEmail')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full space-y-6">
      <Suspense fallback={<VerifyEmailSkeleton />}>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  )
}
