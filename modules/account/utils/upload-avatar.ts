import { uploadAvatarAction } from '../actions/account-actions'

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  const result = await uploadAvatarAction(formData)

  if (!result.success || !result.data) return null

  return (result.data as { url: string }).url
}
