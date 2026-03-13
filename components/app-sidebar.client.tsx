'use client'

import { useMemo } from 'react'
import { authClient } from '@/lib/auth-client'
import { Sidebar, SidebarRail } from '@/components/ui/sidebar'
import {
  SidebarBrandHeader,
  SidebarNavContent,
  SidebarUserMenu,
  getVisibleGroups,
} from '@/components/sidebar'
import type { UserRole } from '@/components/sidebar'
import type { ServerSession } from '@/lib/auth-server'

interface AppSidebarProps {
  session?: ServerSession
}

export function AppSidebar({ session: serverSession }: AppSidebarProps) {
  const { data: clientSession, isPending } = authClient.useSession()
  const session = serverSession ?? clientSession

  const role = (session?.user as { role?: UserRole } | undefined)?.role
  const visibleGroups = useMemo(
    () => (role ? getVisibleGroups(role) : []),
    [role],
  )

  const isLoading = !serverSession && isPending

  return (
    <Sidebar collapsible="icon">
      <SidebarBrandHeader />
      <SidebarNavContent
        isLoading={isLoading || !role}
        visibleGroups={visibleGroups}
      />
      {session && <SidebarUserMenu session={session} />}
      <SidebarRail />
    </Sidebar>
  )
}
