import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-server'
import { MapPin } from 'lucide-react'
import * as accountService from '../services/account-service'
import { AddressList } from './address-list'

export async function AddressesPage() {
  const [session, t] = await Promise.all([
    requireAuth(),
    getTranslations('account.addresses'),
  ])

  const addresses = await accountService.getAddresses(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <MapPin className="text-muted-foreground mb-3 size-10" />
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </div>
      ) : null}

      <AddressList addresses={addresses} />
    </div>
  )
}
