'use client'

import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { AddressCard } from './address-card'
import type { Address } from '../types'

interface AddressListProps {
  addresses: Address[]
}

export function AddressList({ addresses }: AddressListProps) {
  const t = useTranslations('account.addresses')

  return (
    <>
      <Button asChild>
        <Link href="/account/addresses/new">
          <Plus className="mr-2 size-4" />
          {t('addBtn')}
        </Link>
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>
    </>
  )
}
