'use server'

import { z } from 'zod/v4'
import { requireAuth } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import * as accountService from '../services/account-service'
import {
  createProfileUpdateSchema,
  createAddressFormSchema,
} from '../validations'

// Rate limit: 20 write operations per user per 5 minutes
const WRITE_RATE_LIMIT = { maxAttempts: 20, windowMs: 5 * 60 * 1000 }
// Rate limit: 5 upload operations per user per 5 minutes
const UPLOAD_RATE_LIMIT = { maxAttempts: 5, windowMs: 5 * 60 * 1000 }

function checkWriteLimit(userId: string): ActionResult | null {
  const result = checkRateLimit(`account:write:${userId}`, WRITE_RATE_LIMIT)
  if (!result.success) {
    return { success: false, error: 'validation.tooManyRequests' }
  }
  return null
}

function checkUploadLimit(userId: string): ActionResult | null {
  const result = checkRateLimit(`account:upload:${userId}`, UPLOAD_RATE_LIMIT)
  if (!result.success) {
    return { success: false, error: 'validation.tooManyRequests' }
  }
  return null
}

const passthrough = (key: string) => key
const profileUpdateSchema = createProfileUpdateSchema(passthrough)
const addressFormSchema = createAddressFormSchema(passthrough)

export type ActionResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

// Profile
export async function getProfileAction() {
  const session = await requireAuth()
  return accountService.getProfile(session.user.id)
}

export async function updateProfileAction(
  data: unknown,
): Promise<ActionResult> {
  const session = await requireAuth()
  const limited = checkWriteLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  const parsed = profileUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'validation.invalid',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  await accountService.updateProfile(session.user.id, {
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  })

  await createAuditLog({
    action: 'profile.updated',
    entityType: 'user',
    entityId: session.user.id,
    userId: session.user.id,
    severity: 'low',
    metadata,
  })

  return { success: true }
}

// Avatar
export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult & { data?: unknown }> {
  const session = await requireAuth()
  const limited = checkUploadLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'validation.fileRequired' }
  }

  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'validation.fileTypeNotAllowed' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'validation.fileTooLarge' }
  }

  const { getStorageService } = await import('@/lib/providers')
  const storage = getStorageService()

  const extension = MIME_TO_EXT[file.type] || 'jpg'
  const uniqueId = crypto.randomUUID().slice(0, 8)
  const key = `public/avatars/${session.user.id}/${uniqueId}.${extension}`

  const publicUrl = await storage.upload(key, file, file.type)

  const profile = await accountService.getProfile(session.user.id)
  await accountService.updateProfile(session.user.id, {
    name: profile?.name ?? '',
    image: publicUrl,
  })

  await createAuditLog({
    action: 'profile.avatar_updated',
    entityType: 'user',
    entityId: session.user.id,
    userId: session.user.id,
    severity: 'low',
    metadata,
  })

  return { success: true, data: { url: publicUrl } }
}

// Addresses
export async function getAddressesAction() {
  const session = await requireAuth()
  return accountService.getAddresses(session.user.id)
}

export async function createAddressAction(
  data: unknown,
): Promise<ActionResult> {
  const session = await requireAuth()
  const limited = checkWriteLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  const parsed = addressFormSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'validation.invalid',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const { id: _, ...addressData } = parsed.data
  const address = await accountService.createAddress({
    ...addressData,
    userId: session.user.id,
  })

  await createAuditLog({
    action: 'address.created',
    entityType: 'address',
    entityId: address!.id,
    userId: session.user.id,
    metadata,
  })

  return { success: true }
}

export async function updateAddressAction(
  data: unknown,
): Promise<ActionResult> {
  const session = await requireAuth()
  const limited = checkWriteLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  const parsed = addressFormSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'validation.invalid',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  if (!parsed.data.id) {
    return { success: false, error: 'validation.addressIdRequired' }
  }

  const { id, ...rest } = parsed.data
  await accountService.updateAddress(id, session.user.id, rest)

  await createAuditLog({
    action: 'address.updated',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
    metadata,
  })

  return { success: true }
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()
  const limited = checkWriteLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  await accountService.deleteAddress(id, session.user.id)

  await createAuditLog({
    action: 'address.deleted',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
    severity: 'high',
    metadata,
  })

  return { success: true }
}

export async function setDefaultAddressAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireAuth()
  const limited = checkWriteLimit(session.user.id)
  if (limited) return limited
  const metadata = await getRequestMetadata()

  await accountService.setDefaultAddress(id, session.user.id)

  await createAuditLog({
    action: 'address.set_default',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
    severity: 'low',
    metadata,
  })

  return { success: true }
}
