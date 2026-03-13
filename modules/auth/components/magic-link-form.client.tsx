'use client'

import { useCallback, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { authClient } from '@/lib/auth-client'
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
import { CheckCircle, Loader2, Mail, Wand2 } from 'lucide-react'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

const magicLinkSchema = z.object({
  email: z.email(),
})

type MagicLinkInput = z.infer<typeof magicLinkSchema>

interface MagicLinkFormProps {
  onBackToPassword: () => void
}

export function MagicLinkForm({ onBackToPassword }: MagicLinkFormProps) {
  const t = useTranslations('auth.login.magicLink')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = useCallback(
    (values: MagicLinkInput) => {
      startTransition(async () => {
        setError(null)

        const result = await authClient.signIn.magicLink({
          email: values.email,
          callbackURL: DEFAULT_LOGIN_REDIRECT,
        })

        if (result.error) {
          setError(result.error.message ?? t('error'))
          return
        }

        setSuccess(true)
      })
    },
    [startTransition, t],
  )

  if (success) {
    return (
      <div className="grid gap-6">
        <div className="bg-success/10 border-success/20 flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
          <div className="bg-success/20 flex size-12 items-center justify-center rounded-full">
            <CheckCircle className="text-success size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{t('successTitle')}</h3>
            <p className="text-muted-foreground text-sm">{t('successDesc')}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToPassword}
        >
          {t('backToPassword')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <Wand2 className="text-primary size-6" />
        </div>
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

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

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            {t('submitButton')}
          </Button>
        </form>
      </Form>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBackToPassword}
      >
        {t('backToPassword')}
      </Button>
    </div>
  )
}
