import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-server'
import * as addressRepo from '@/modules/account/repositories/address-repository'
import { AddressForm } from '@/modules/account/components/address-form'

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
    addressRepo.findById(id, session.user.id),
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
