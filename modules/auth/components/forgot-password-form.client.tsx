'use client'

import { useCallback, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import {
  createForgotPasswordSchema,
  type ForgotPasswordInput,
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
import { Loader2, Mail } from 'lucide-react'

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword')
  const tv = useTranslations('validation')
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(createForgotPasswordSchema(tv)),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = useCallback(
    (values: ForgotPasswordInput) => {
      startTransition(async () => {
        await authClient.requestPasswordReset({
          email: values.email,
          redirectTo: '/reset-password',
        })

        // Always show success (OWASP: don't reveal if email exists)
        setSent(true)
      })
    },
    [startTransition],
  )

  if (sent) {
    return (
      <div className="grid gap-4 text-center">
        <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
          <Mail className="text-muted-foreground size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{t('checkEmailTitle')}</h3>
          <p className="text-muted-foreground text-sm">{t('checkEmailDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('emailLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {t('submitButton')}
        </Button>
      </form>
    </Form>
  )
}
