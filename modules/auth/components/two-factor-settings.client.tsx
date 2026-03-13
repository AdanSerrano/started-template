'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import type {
  TwoFactorEnableInput,
  TwoFactorVerifyInput,
} from '@/modules/auth/validations'
import {
  TwoFactorIdleState,
  TwoFactorEnableForm,
  TwoFactorVerifyForm,
  TwoFactorDisableForm,
} from './two-factor'

type Step = 'idle' | 'enabling' | 'verify' | 'disabling'

export function TwoFactorSettings() {
  const t = useTranslations('twoFactorSettings')
  const { data: session } = authClient.useSession()
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const isEnabled = useMemo(
    () => session?.user?.twoFactorEnabled,
    [session?.user?.twoFactorEnabled],
  )

  const handleEnable = useCallback(
    (values: TwoFactorEnableInput) => {
      startTransition(async () => {
        setError(null)
        const result = await authClient.twoFactor.enable({
          password: values.password,
        })

        if (result.error) {
          setError(result.error.message ?? t('enableError'))
          return
        }

        if (result.data) {
          setTotpUri(result.data.totpURI)
          setBackupCodes(result.data.backupCodes)
          setStep('verify')
        }
      })
    },
    [startTransition, t],
  )

  const handleVerify = useCallback(
    (values: TwoFactorVerifyInput) => {
      startTransition(async () => {
        setError(null)
        const result = await authClient.twoFactor.verifyTotp({
          code: values.code,
        })

        if (result.error) {
          setError(result.error.message ?? t('invalidCode'))
          return
        }

        setStep('idle')
        setTotpUri(null)
      })
    },
    [startTransition, t],
  )

  const handleDisable = useCallback(
    (values: TwoFactorEnableInput) => {
      startTransition(async () => {
        setError(null)
        const result = await authClient.twoFactor.disable({
          password: values.password,
        })

        if (result.error) {
          setError(result.error.message ?? t('disableError'))
          return
        }

        setStep('idle')
        setBackupCodes([])
      })
    },
    [startTransition, t],
  )

  const handleToggle = useCallback(() => {
    setStep(isEnabled ? 'disabling' : 'enabling')
  }, [isEnabled])

  const handleCancel = useCallback(() => {
    setStep('idle')
    setError(null)
  }, [])

  if (step === 'enabling') {
    return (
      <TwoFactorEnableForm
        error={error}
        isPending={isPending}
        onSubmit={handleEnable}
        onCancel={handleCancel}
      />
    )
  }

  if (step === 'verify') {
    return (
      <TwoFactorVerifyForm
        totpUri={totpUri}
        backupCodes={backupCodes}
        error={error}
        isPending={isPending}
        onSubmit={handleVerify}
      />
    )
  }

  if (step === 'disabling') {
    return (
      <TwoFactorDisableForm
        error={error}
        isPending={isPending}
        onSubmit={handleDisable}
        onCancel={handleCancel}
      />
    )
  }

  return <TwoFactorIdleState isEnabled={!!isEnabled} onToggle={handleToggle} />
}
