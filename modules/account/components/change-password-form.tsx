'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { FormTextField } from '@/components/forms/form-text-field'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { authClient } from '@/lib/auth-client'
import { changePasswordSchema, type ChangePasswordInput } from '../validations'

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('account.password')

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      if (error) {
        toast.error(t('error'))
      } else {
        toast.success(t('updated'))
        form.reset()
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormTextField
          control={form.control}
          name="currentPassword"
          label={t('currentPassword')}
          type="password"
          autoComplete="current-password"
        />
        <FormTextField
          control={form.control}
          name="newPassword"
          label={t('newPassword')}
          type="password"
          autoComplete="new-password"
        />
        <FormTextField
          control={form.control}
          name="confirmPassword"
          label={t('confirmPassword')}
          type="password"
          autoComplete="new-password"
        />
        <FormSubmitButton isPending={isPending} text={t('saveBtn')} />
      </form>
    </Form>
  )
}
