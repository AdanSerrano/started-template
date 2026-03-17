import { getTranslations } from 'next-intl/server'
import type { AuthenticatedSession } from '@/lib/auth-server'
import { ChangePasswordForm } from './change-password-form.client'
import { ProfileForm } from './profile-form.client'
import type { ProfileUpdateData } from '../types'

interface ProfilePageProps {
  session: AuthenticatedSession
  profile: (ProfileUpdateData & { email: string; image?: string | null }) | null
}

export async function ProfilePage({ session, profile }: ProfilePageProps) {
  const [t, tPassword] = await Promise.all([
    getTranslations('account.profile'),
    getTranslations('account.password'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>

      <div className="border-border rounded-lg border p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('personalInfo')}</h2>
        <div className="mb-4 space-y-1">
          <p className="text-muted-foreground text-sm">
            {t('emailLabel')}: {profile?.email}
          </p>
        </div>
        <ProfileForm
          defaultValues={{
            name: profile?.name ?? '',
            phone: profile?.phone ?? '',
          }}
          userId={session.user.id}
          currentImage={profile?.image}
        />
      </div>

      <div className="border-border rounded-lg border p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">{tPassword('title')}</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {tPassword('subtitle')}
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
