'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { MapPin, Star, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '../actions/account-actions'
import type { Address } from '../types'

interface AddressCardProps {
  address: Address
}

export function AddressCard({ address }: AddressCardProps) {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('account.addresses')
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAddressAction(address.id)
      if (result.success) {
        toast.success(t('deleted'))
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleSetDefault() {
    startTransition(async () => {
      const result = await setDefaultAddressAction(address.id)
      if (result.success) {
        toast.success(t('defaultSet'))
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="border-border relative rounded-lg border p-4">
      {address.isDefault && (
        <Badge variant="secondary" className="absolute top-3 right-3">
          <Star className="mr-1 size-3" />
          {t('default')}
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {address.firstName} {address.lastName}
          </p>
          <p className="text-muted-foreground text-sm">{address.street}</p>
          <p className="text-muted-foreground text-sm">
            {address.postalCode} {address.city}
            {address.province ? `, ${address.province}` : ''}
          </p>
          {address.phone && (
            <p className="text-muted-foreground text-sm">{address.phone}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleSetDefault}
          >
            <Star className="mr-1 size-3" />
            {t('setDefault')}
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/account/addresses/${address.id}/edit`}>
            <Pencil className="mr-1 size-3" />
            {t('edit')}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1 size-3" />
          {t('delete')}
        </Button>
      </div>
    </div>
  )
}
