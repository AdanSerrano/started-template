'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { LogOut } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { accountNavItems } from '../config/account-nav-config'

export function AccountSidebar() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="border-border hidden w-64 shrink-0 border-r pr-8 lg:block">
        <nav className="sticky top-20 space-y-1">
          {accountNavItems.map((item) => {
            const isActive =
              item.href === '/account'
                ? pathname === '/account'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            )
          })}
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive w-full justify-start gap-3 px-3"
            onClick={async () => {
              await authClient.signOut()
              router.push('/login')
              router.refresh()
            }}
          >
            <LogOut className="size-4" />
            {t('common.logout')}
          </Button>
        </nav>
      </aside>

      {/* Mobile horizontal nav */}
      <nav className="border-border/50 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b px-4 pb-2 lg:hidden">
        {accountNavItems.map((item) => {
          const isActive =
            item.href === '/account'
              ? pathname === '/account'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <item.icon className="size-4" />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
