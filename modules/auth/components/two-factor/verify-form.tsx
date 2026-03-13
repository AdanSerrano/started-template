'use client'

import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  createTwoFactorVerifySchema,
  type TwoFactorVerifyInput,
} from '@/modules/auth/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Copy, Check } from 'lucide-react'

interface VerifyFormProps {
  totpUri: string | null
  backupCodes: string[]
  error: string | null
  isPending: boolean
  onSubmit: (values: TwoFactorVerifyInput) => void
}

export const TwoFactorVerifyForm = memo(function TwoFactorVerifyForm({
  totpUri,
  backupCodes,
  error,
  isPending,
  onSubmit,
}: VerifyFormProps) {
  const t = useTranslations('twoFactorSettings')
  const tv = useTranslations('validation')
  const [copied, setCopied] = useState(false)

  const form = useForm<TwoFactorVerifyInput>({
    resolver: zodResolver(createTwoFactorVerifySchema(tv)),
    defaultValues: { code: '' },
  })

  const copyBackupCodes = useCallback(async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [backupCodes])

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-medium">{t('scanTitle')}</h3>
      <p className="text-muted-foreground text-sm">{t('scanDesc')}</p>

      {totpUri && (
        <div className="bg-muted flex items-center justify-center rounded-lg p-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
            alt={t('qrAlt')}
            width={200}
            height={200}
          />
        </div>
      )}

      {backupCodes.length > 0 && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t('backupCodes')}</p>
            <Button variant="ghost" size="sm" onClick={copyBackupCodes}>
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? t('copied') : t('copy')}
            </Button>
          </div>
          <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-3 font-mono text-sm">
            {backupCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">{t('backupWarning')}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('verificationCode')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center tracking-widest"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {t('verifyAndActivate')}
          </Button>
        </form>
      </Form>
    </div>
  )
})
