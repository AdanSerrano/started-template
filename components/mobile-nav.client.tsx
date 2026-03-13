'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { LogOut, Menu, UserCircle, Zap } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ThemeSwitcher } from '@/components/theme-switcher.client'
import { LanguageSwitcher } from '@/components/language-switcher.client'
import type { ServerSession } from '@/lib/auth-server'

interface MobileNavProps {
  /** Session fetched on the server — avoids loading state */
  session?: ServerSession
}

export function MobileNav({ session: serverSession }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  // Use server session if provided, otherwise fall back to client
  const { data: clientSession } = authClient.useSession()
  const session = serverSession ?? clientSession
  const tCommon = useTranslations('common')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">{tCommon('openMenu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
              <Zap className="size-4 text-white" />
            </div>
            {tCommon('appName')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-1 px-4 py-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        <div className="mt-auto flex flex-col gap-2 p-4">
          {!session ? (
            <>
              <Button variant="outline" asChild onClick={() => setOpen(false)}>
                <Link href="/login">{tCommon('login')}</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/register">{tCommon('register')}</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-1 pb-3">
                <Avatar size="default">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name}
                  />
                  <AvatarFallback>
                    {session.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <Separator className="mb-2" />
              <Button
                variant="default"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/account">
                  <UserCircle className="size-4" />
                  {tCommon('myAccount')}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={async () => {
                  setOpen(false)
                  await authClient.signOut()
                  router.push('/login')
                  router.refresh()
                }}
              >
                <LogOut className="size-4" />
                {tCommon('logout')}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
