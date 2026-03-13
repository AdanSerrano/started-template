'use server'

import { z } from 'zod/v4'
import { requireAuth } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/audit'
import * as accountService from '../services/account-service'
import {
  createProfileUpdateSchema,
  createAddressFormSchema,
} from '../validations'

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

  const parsed = profileUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos invalidos',
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
  })

  return { success: true }
}

// Avatar
export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult & { data?: unknown }> {
  const session = await requireAuth()

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'Archivo requerido' }
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
    return { success: false, error: 'Tipo de archivo no permitido' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'El archivo excede 5MB' }
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

  const parsed = addressFormSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos invalidos',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...addressData } = parsed.data
  const address = await accountService.createAddress({
    ...addressData,
    userId: session.user.id,
  })

  await createAuditLog({
    action: 'address.created',
    entityType: 'address',
    entityId: address!.id,
    userId: session.user.id,
  })

  return { success: true }
}

export async function updateAddressAction(
  data: unknown,
): Promise<ActionResult> {
  const session = await requireAuth()

  const parsed = addressFormSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos invalidos',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  if (!parsed.data.id) {
    return { success: false, error: 'ID de direccion requerido' }
  }

  const { id, ...rest } = parsed.data
  await accountService.updateAddress(id, session.user.id, rest)

  await createAuditLog({
    action: 'address.updated',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
  })

  return { success: true }
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  await accountService.deleteAddress(id, session.user.id)

  await createAuditLog({
    action: 'address.deleted',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
    severity: 'high',
  })

  return { success: true }
}

export async function setDefaultAddressAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireAuth()

  await accountService.setDefaultAddress(id, session.user.id)

  await createAuditLog({
    action: 'address.set_default',
    entityType: 'address',
    entityId: id,
    userId: session.user.id,
    severity: 'low',
  })

  return { success: true }
}
