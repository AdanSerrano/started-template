'use client'

import { memo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { NavGroup, NavItem } from './sidebar-nav-config'

interface SidebarNavContentProps {
  isLoading: boolean
  visibleGroups: NavGroup[]
}

export const SidebarNavContent = memo(function SidebarNavContent({
  isLoading,
  visibleGroups,
}: SidebarNavContentProps) {
  const pathname = usePathname()
  const t = useTranslations('sidebar')

  const isActive = useCallback(
    (url: string) => {
      if (url === '/dashboard') return pathname === '/dashboard'
      if (url === '/dashboard/settings')
        return pathname === '/dashboard/settings'
      return pathname.startsWith(url)
    },
    [pathname],
  )

  if (isLoading) {
    return (
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    )
  }

  return (
    <SidebarContent>
      {visibleGroups.map((group) => (
        <SidebarGroup key={group.labelKey}>
          <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) =>
                item.subItems && item.subItems.length > 0 ? (
                  <CollapsibleNavItem
                    key={item.url}
                    item={item}
                    isActive={isActive}
                    t={t}
                  />
                ) : (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={t(item.titleKey)}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  )
})

function CollapsibleNavItem({
  item,
  isActive,
  t,
}: {
  item: NavItem
  isActive: (url: string) => boolean
  t: (key: string) => string
}) {
  const parentActive = isActive(item.url)

  return (
    <Collapsible
      asChild
      defaultOpen={parentActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={parentActive} tooltip={t(item.titleKey)}>
            <item.icon />
            <span>{t(item.titleKey)}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                asChild
                isActive={
                  isActive(item.url) &&
                  !item.subItems!.some((sub) => isActive(sub.url))
                }
              >
                <Link href={item.url}>
                  <span>{t('shippingRates')}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {item.subItems!.map((sub) => (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton asChild isActive={isActive(sub.url)}>
                  <Link href={sub.url}>
                    <span>{t(sub.titleKey)}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
