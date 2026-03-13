'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'

export function VerifyEmailStatus() {
  const t = useTranslations('auth.verifyEmail')
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!error) {
      const timer = setTimeout(() => {
        router.push(`${DEFAULT_LOGOUT_REDIRECT}?verified=true`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, router])

  if (error) {
    return (
      <div className="grid gap-4 text-center">
        <div className="bg-destructive/10 mx-auto flex size-12 items-center justify-center rounded-full">
          <AlertCircle className="text-destructive size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{t('invalidLinkTitle')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('invalidLinkDesc')}
          </p>
        </div>
        <Button asChild variant="outline" className="mx-auto w-fit">
          <Link href={DEFAULT_LOGOUT_REDIRECT}>{t('goToLogin')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 text-center">
      <div className="bg-success/10 mx-auto flex size-12 items-center justify-center rounded-full">
        <CheckCircle className="text-success size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{t('verifiedTitle')}</h3>
        <p className="text-muted-foreground text-sm">{t('verifiedDesc')}</p>
      </div>
      <div className="flex justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    </div>
  )
}
