'use client'

import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  createTwoFactorEnableSchema,
  type TwoFactorEnableInput,
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

interface EnableFormProps {
  error: string | null
  isPending: boolean
  onSubmit: (values: TwoFactorEnableInput) => void
  onCancel: () => void
}

export const TwoFactorEnableForm = memo(function TwoFactorEnableForm({
  error,
  isPending,
  onSubmit,
  onCancel,
}: EnableFormProps) {
  const t = useTranslations('twoFactorSettings')
  const tv = useTranslations('validation')

  const form = useForm<TwoFactorEnableInput>({
    resolver: zodResolver(createTwoFactorEnableSchema(tv)),
    defaultValues: { password: '' },
  })

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-medium">{t('enableTitle')}</h3>
      <p className="text-muted-foreground text-sm">{t('enableDesc')}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onCancel}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {t('continue')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
})
