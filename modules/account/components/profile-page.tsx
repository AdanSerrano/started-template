import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-server'
import * as accountService from '../services/account-service'
import { ProfileForm } from './profile-form'
import { ChangePasswordForm } from './change-password-form'

export async function ProfilePage() {
  const session = await requireAuth()

  const [profile, t, tPassword] = await Promise.all([
    accountService.getProfile(session.user.id),
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
