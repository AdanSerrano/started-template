import { requireAuth } from '@/lib/auth-server'
import { AccountSidebar } from '@/modules/account/components/account-sidebar'
import { Link } from '@/i18n/navigation'
import { ThemeSwitcher } from '@/components/theme-switcher.client'
import { LanguageSwitcher } from '@/components/language-switcher.client'
import { Zap } from 'lucide-react'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen">
      <header className="border-border/50 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary flex size-9 items-center justify-center rounded-lg">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Starter App
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <AccountSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
