'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
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
import { Loader2 } from 'lucide-react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export function TwoFactorVerifyForm() {
  const t = useTranslations('auth.twoFactor')
  const tv = useTranslations('validation')
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<TwoFactorVerifyInput>({
    resolver: zodResolver(createTwoFactorVerifySchema(tv)),
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = useCallback(
    (values: TwoFactorVerifyInput) => {
      startTransition(async () => {
        setError(null)

        const result = await authClient.twoFactor.verifyTotp({
          code: values.code,
          trustDevice: true,
        })

        if (result.error) {
          setError(result.error.message ?? t('error'))
          return
        }

        router.push(DEFAULT_LOGIN_REDIRECT)
        router.refresh()
      })
    },
    [router, startTransition, t],
  )

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('codeLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {t('submitButton')}
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-center text-sm">
        {t('codeHint')}
      </p>
    </div>
  )
}
