import { requireAuth } from '@/lib/auth-server'
import { ProfilePage } from '@/modules/account/components/profile-page'
import * as accountService from '@/modules/account/services/account-service'

export default async function AccountPage() {
  const session = await requireAuth()
  const profile = await accountService.getProfile(session.user.id)

  return <ProfilePage session={session} profile={profile} />
}
