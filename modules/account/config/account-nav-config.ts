import { UserCircle, MapPin, type LucideIcon } from 'lucide-react'

export type AccountNavItem = {
  labelKey: string
  href: string
  icon: LucideIcon
}

export const accountNavItems: AccountNavItem[] = [
  {
    labelKey: 'account.nav.profile',
    href: '/account',
    icon: UserCircle,
  },
  {
    labelKey: 'account.nav.addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
]
