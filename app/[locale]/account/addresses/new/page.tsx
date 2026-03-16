import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-server'
import { AddressForm } from '@/modules/account/components/address-form.client'

export default async function NewAddressPage() {
  const [, t] = await Promise.all([
    requireAuth(),
    getTranslations('account.addresses'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('addTitle')}</h1>
      </div>
      <AddressForm />
    </div>
  )
}
