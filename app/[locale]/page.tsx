import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getServerSession } from '@/lib/auth-server'
import { Link } from '@/i18n/navigation'
import { ThemeSwitcher } from '@/components/theme-switcher.client'
import { LanguageSwitcher } from '@/components/language-switcher.client'
import {
  ArrowRight,
  Database,
  Globe,
  Lock,
  Mail,
  Palette,
  Shield,
  Zap,
} from 'lucide-react'

export const revalidate = 3600

/* ── Auth-aware CTA (streamed, does NOT block page render) ── */
async function AuthCTA() {
  const [tc, session] = await Promise.all([
    getTranslations('common'),
    getServerSession(),
  ])

  return session ? (
    <Link
      href="/account"
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium transition-colors"
    >
      {tc('myAccount')}
    </Link>
  ) : (
    <Link
      href="/login"
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium transition-colors"
    >
      {tc('login')}
    </Link>
  )
}

export default async function Home() {
  const [t, tc] = await Promise.all([
    getTranslations('landing'),
    getTranslations('common'),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-border/50 bg-background sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary flex size-9 items-center justify-center rounded-lg">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              {tc('appName')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Suspense
              fallback={
                <span className="bg-primary/10 inline-flex h-9 w-20 animate-pulse rounded-md" />
              }
            >
              <AuthCTA />
            </Suspense>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-widest">
              {t('hero.badge')}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('hero.titleStart')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              {t('hero.description')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center gap-2 rounded-lg px-6 text-base font-medium transition-colors"
              >
                {t('hero.cta')}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-base font-medium transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/40 dark:bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                {t('features.title')}
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                {t('features.subtitle')}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Lock,
                  title: t('features.auth.title'),
                  desc: t('features.auth.desc'),
                },
                {
                  icon: Database,
                  title: t('features.database.title'),
                  desc: t('features.database.desc'),
                },
                {
                  icon: Globe,
                  title: t('features.i18n.title'),
                  desc: t('features.i18n.desc'),
                },
                {
                  icon: Mail,
                  title: t('features.email.title'),
                  desc: t('features.email.desc'),
                },
                {
                  icon: Palette,
                  title: t('features.theme.title'),
                  desc: t('features.theme.desc'),
                },
                {
                  icon: Shield,
                  title: t('features.security.title'),
                  desc: t('features.security.desc'),
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-background rounded-xl border p-6"
                >
                  <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-2.5">
                    <feature.icon className="text-primary size-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                {t('stack.title')}
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                {t('stack.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[
                'Next.js 16',
                'React 19',
                'TypeScript',
                'Tailwind CSS 4',
                'shadcn/ui',
                'Drizzle ORM',
                'PostgreSQL (Neon)',
                'Better Auth',
                'Resend',
                'Cloudflare R2',
                'Zustand',
                'Zod',
              ].map((tech) => (
                <div
                  key={tech}
                  className="bg-muted/50 flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border/50 border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  )
}
