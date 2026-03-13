'use client'

import { useCallback, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import {
  createResetPasswordSchema,
  type ResetPasswordInput,
} from '@/modules/auth/validations'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input.client'
import { PasswordStrengthField } from '@/components/password-strength.client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'

export function ResetPasswordForm() {
  const t = useTranslations('auth.resetPassword')
  const tv = useTranslations('validation')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const errorParam = searchParams.get('error')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(createResetPasswordSchema(tv)),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = useCallback(
    (values: ResetPasswordInput) => {
      startTransition(async () => {
        setError(null)

        const result = await authClient.resetPassword({
          newPassword: values.password,
          token: token!,
        })

        if (result.error) {
          setError(result.error.message ?? t('error'))
          return
        }

        router.push(`${DEFAULT_LOGOUT_REDIRECT}?reset=true`)
      })
    },
    [token, router, startTransition, t],
  )

  if (errorParam === 'INVALID_TOKEN' || (!token && !errorParam)) {
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
          <Link href="/forgot-password">{t('requestNewLink')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newPasswordLabel')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <PasswordStrengthField control={form.control} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  autoComplete="new-password"
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
  )
}
