import { uploadAvatarAction } from '../actions/avatar-actions'

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  const result = await uploadAvatarAction(formData)

  if (!result.success || !result.data) return null

  const data = result.data
  if (typeof data === 'object' && data !== null && 'url' in data) {
    return (data as { url: string }).url
  }
  return null
}
