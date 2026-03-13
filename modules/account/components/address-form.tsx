'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { FormTextField } from '@/components/forms/form-text-field'
import {
  FormSubmitButton,
  FormCancelButton,
  FormButtonGroup,
} from '@/components/forms/form-submit-button'
import { createAddressFormSchema, type AddressFormInput } from '../validations'
import {
  createAddressAction,
  updateAddressAction,
} from '../actions/account-actions'

interface AddressFormProps {
  defaultValues?: AddressFormInput | undefined
  onSuccess?: (() => void) | undefined
  onCancel?: (() => void) | undefined
}

export function AddressForm({
  defaultValues,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('account.addresses')
  const tv = useTranslations('validation')
  const router = useRouter()
  const isEditing = !!defaultValues?.id

  const form = useForm<AddressFormInput>({
    resolver: zodResolver(createAddressFormSchema(tv)),
    mode: 'onTouched',
    defaultValues: defaultValues ?? {
      id: '',
      type: 'shipping',
      isDefault: false,
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'ES',
      phone: '',
    },
  })

  function onSubmit(values: AddressFormInput) {
    startTransition(async () => {
      const result = isEditing
        ? await updateAddressAction(values)
        : await createAddressAction(values)

      if (result.success) {
        toast.success(isEditing ? t('updated') : t('created'))
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/account/addresses')
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="firstName"
            label={t('firstName')}
            required
          />
          <FormTextField
            control={form.control}
            name="lastName"
            label={t('lastName')}
            required
          />
        </div>
        <FormTextField
          control={form.control}
          name="street"
          label={t('street')}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="city"
            label={t('city')}
            required
          />
          <FormTextField
            control={form.control}
            name="province"
            label={t('province')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="postalCode"
            label={t('postalCode')}
            required
          />
          <FormTextField
            control={form.control}
            name="phone"
            label={t('phone')}
            type="tel"
          />
        </div>
        <FormButtonGroup>
          <FormCancelButton
            text={t('cancel')}
            onClick={onCancel ?? (() => router.push('/account/addresses'))}
          />
          <FormSubmitButton
            isPending={isPending}
            text={isEditing ? t('updateBtn') : t('createBtn')}
          />
        </FormButtonGroup>
      </form>
    </Form>
  )
}
