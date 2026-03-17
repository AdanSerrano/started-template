import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-server'
import { AddressForm } from '@/modules/account/components/address-form.client'
import { getAddress } from '@/modules/account/services/account-service'

interface EditAddressPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const session = await requireAuth()
  const { id } = await params
  const [t, address] = await Promise.all([
    getTranslations('account.addresses'),
    getAddress(id, session.user.id),
  ])

  if (!address) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('editTitle')}</h1>
      </div>
      <AddressForm
        defaultValues={{
          id: address.id,
          type: address.type as 'shipping' | 'billing',
          isDefault: address.isDefault,
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          city: address.city,
          province: address.province ?? '',
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone ?? '',
        }}
      />
    </div>
  )
}
