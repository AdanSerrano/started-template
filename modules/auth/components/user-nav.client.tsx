'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, User } from 'lucide-react'

export function UserNav() {
  const t = useTranslations('auth.userNav')
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const initials = useMemo(
    () =>
      session?.user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '',
    [session?.user.name],
  )

  const handleSignOut = useCallback(async () => {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }, [router])

  const handleNavigateSettings = useCallback(() => {
    router.push('/account')
  }, [router])

  if (!session) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar size="default">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleNavigateSettings}>
          <Settings />
          {t('settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNavigateSettings}>
          <User />
          {t('profile')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
