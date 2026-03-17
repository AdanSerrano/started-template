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

function checkWriteLimit(userId: string): ActionResult | null {
  const result = checkRateLimit(`account:write:${userId}`, WRITE_RATE_LIMIT)
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
