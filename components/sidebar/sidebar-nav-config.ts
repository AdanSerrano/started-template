import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Settings } from 'lucide-react'

export type UserRole = 'super_admin' | 'admin' | 'user'

export interface NavSubItem {
  titleKey: string
  url: string
  icon?: LucideIcon | undefined
}

export interface NavItem {
  titleKey: string
  url: string
  icon: LucideIcon
  roles: UserRole[]
  subItems?: NavSubItem[] | undefined
}

export interface NavGroup {
  labelKey: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'general',
    items: [
      {
        titleKey: 'dashboard',
        url: '/account',
        icon: LayoutDashboard,
        roles: ['super_admin', 'admin', 'user'],
      },
      {
        titleKey: 'settings',
        url: '/account',
        icon: Settings,
        roles: ['super_admin', 'admin'],
      },
    ],
  },
]

export function getVisibleGroups(role: UserRole): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)
}
