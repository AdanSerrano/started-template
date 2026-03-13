'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  SidebarHeader as SidebarHeaderPrimitive,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export const SidebarBrandHeader = memo(function SidebarBrandHeader() {
  const tCommon = useTranslations('common')

  return (
    <SidebarHeaderPrimitive className="h-14 justify-center border-b p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/">
              <div className="bg-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="font-serif text-lg font-bold text-white">
                  S
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {tCommon('appName')}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderPrimitive>
  )
})
