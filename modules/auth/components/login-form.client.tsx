'use client'

import { useCallback, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { createLoginSchema, type LoginInput } from '@/modules/auth/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input.client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Link } from '@/i18n/navigation'
import { CheckCircle, Loader2, Mail, Wand2 } from 'lucide-react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { MagicLinkForm } from './magic-link-form.client'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const tv = useTranslations('validation')
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === 'true'
  const reset = searchParams.get('reset') === 'true'
  const [error, setError] = useState<string | null>(null)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showMagicLink, setShowMagicLink] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tv)),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = useCallback(
    (values: LoginInput) => {
      startTransition(async () => {
        setError(null)

        const isEmail = values.identifier.includes('@')

        const result = isEmail
          ? await authClient.signIn.email({
              email: values.identifier,
              password: values.password,
            })
          : await authClient.signIn.username({
              username: values.identifier,
              password: values.password,
            })

        if (result.error) {
          if (result.error.status === 403) {
            setEmailNotVerified(true)
            return
          }
          if (result.error.status === 423) {
            setError(result.error.message ?? t('accountLocked'))
            return
          }
          setError(result.error.message ?? t('error'))
          return
        }

        // Navigate after successful login
        router.push(DEFAULT_LOGIN_REDIRECT)
      })
    },
    [router, startTransition, t],
  )

  if (showMagicLink) {
    return <MagicLinkForm onBackToPassword={() => setShowMagicLink(false)} />
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('identifierLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('identifierPlaceholder')}
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {t('forgotPasswordLink')}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="********"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {verified && (
            <div className="bg-success/10 border-success/20 flex items-center gap-2 rounded-md border px-3 py-2">
              <CheckCircle className="text-success size-4 shrink-0" />
              <p className="text-success text-sm font-medium">
                {t('verifiedMessage')}
              </p>
            </div>
          )}

          {reset && (
            <div className="bg-success/10 border-success/20 flex items-center gap-2 rounded-md border px-3 py-2">
              <CheckCircle className="text-success size-4 shrink-0" />
              <p className="text-success text-sm font-medium">
                {t('resetMessage')}
              </p>
            </div>
          )}

          {emailNotVerified && (
            <div className="bg-warning/10 border-warning/20 flex items-center gap-2 rounded-md border px-3 py-2">
              <Mail className="text-warning size-4 shrink-0" />
              <p className="text-warning text-sm font-medium">
                {t('emailNotVerifiedMessage')}
              </p>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {t('submitButton')}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        disabled={isPending}
        onClick={() => setShowMagicLink(true)}
      >
        <Wand2 className="size-4" />
        {t('magicLink.useMagicLink')}
      </Button>
    </div>
  )
}
