'use client'

import { useCallback, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import {
  createRegisterSchema,
  type RegisterInput,
} from '@/modules/auth/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2, Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const tv = useTranslations('validation')
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(createRegisterSchema(tv)),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = useCallback(
    (values: RegisterInput) => {
      startTransition(async () => {
        setError(null)

        const result = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
          username: values.username,
          callbackURL: '/verify-email',
        })

        if (result.error) {
          setError(result.error.message ?? t('error'))
          return
        }

        setRegistered(true)
      })
    },
    [startTransition, t],
  )

  if (registered) {
    return (
      <div className="grid gap-4 text-center">
        <div className="bg-brand-100 dark:bg-brand-950/30 mx-auto flex size-12 items-center justify-center rounded-full">
          <Mail className="text-brand-600 dark:text-brand-400 size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{t('checkEmailTitle')}</h3>
          <p className="text-muted-foreground text-sm">{t('checkEmailDesc')}</p>
        </div>
        <Link
          href={DEFAULT_LOGOUT_REDIRECT}
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          {t('goToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('nameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('usernameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('usernamePlaceholder')}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('passwordLabel')}</FormLabel>
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

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {t('submitButton')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
