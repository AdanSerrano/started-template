import { Zap, CreditCard, Smartphone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations('authLayout')

  const features = [
    { icon: Zap, text: t('featureQr') },
    { icon: CreditCard, text: t('featurePayments') },
    { icon: Smartphone, text: t('featureWallet') },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding (desktop only) */}
      <div className="from-brand-700 via-brand-600 to-brand-800 relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br p-10 text-white lg:flex">
        {/* Decorative elements */}
        <div className="bg-brand-500/20 absolute -top-24 -left-24 size-96 rounded-full blur-3xl" />
        <div className="bg-brand-400/10 absolute -right-32 -bottom-32 size-[500px] rounded-full blur-3xl" />
        <div className="absolute right-10 bottom-10 grid grid-cols-5 gap-2 opacity-20">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="size-1.5 rounded-full bg-white" />
          ))}
        </div>

        {/* Top — logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold">Starter App</span>
          </Link>
        </div>

        {/* Center — features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl leading-tight font-bold">
              {t('platformTitle')}
              <br />
              {t('platformTitleLine2')}
              <br />
              {t('platformTitleLine3')}
            </h2>
            <p className="max-w-sm text-white/70">{t('platformDesc')}</p>
          </div>

          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="text-brand-200 size-4.5" />
                </div>
                <span className="text-sm font-medium text-white/90">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — testimonial */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-white/30 pl-4">
            <p className="text-sm leading-relaxed text-white/70 italic">
              &quot;{t('testimonial')}&quot;
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form (always visible) */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        {/* Mobile background gradient */}
        <div className="from-brand-50 via-background to-background dark:from-brand-950/20 dark:via-background absolute inset-0 -z-10 bg-linear-to-br lg:hidden" />
        <div className="bg-brand-400/5 absolute top-0 right-0 -z-10 h-[400px] w-[600px] rounded-full blur-3xl lg:hidden" />

        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Logo — mobile only */}
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="bg-primary flex size-10 items-center justify-center rounded-xl">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold">Starter App</span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
