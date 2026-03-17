'use server'

import { z } from 'zod/v4'
import { createAuditLog } from '@/lib/audit'
import { requireAuth } from '@/lib/auth-server'
import { TooManyRequestsError, ValidationError } from '@/lib/errors'
import type { RateLimitConfig } from '@/lib/interfaces'
import { checkRateLimit } from '@/lib/rate-limit'
import { createSafeAction } from '@/lib/safe-action'
import * as accountService from '../services/account-service'
import {
  createProfileUpdateSchema,
  createAddressFormSchema,
} from '../validations'

// Rate limit: 20 write operations per user per 5 minutes
const WRITE_RATE_LIMIT: RateLimitConfig = { limit: 20, windowSeconds: 300 }

function enforceWriteLimit(userId: string): void {
  const result = checkRateLimit(`account:write:${userId}`, WRITE_RATE_LIMIT)
  if (!result.success) {
    throw new TooManyRequestsError(
      'validation.tooManyRequests',
      result.reset - Date.now(),
    )
  }
}

const passthrough = (key: string) => key
const profileUpdateSchema = createProfileUpdateSchema(passthrough)
const addressFormSchema = createAddressFormSchema(passthrough)

// Profile (read-only — keep manual)
export async function getProfileAction() {
  const session = await requireAuth()
  return accountService.getProfile(session.user.id)
}

export const updateProfileAction = createSafeAction(
  { schema: profileUpdateSchema, auth: true },
  async ({ data, session, metadata }) => {
    enforceWriteLimit(session.user.id)

    await accountService.updateProfile(session.user.id, {
      name: data.name,
      phone: data.phone || null,
    })

    await createAuditLog({
      action: 'profile.updated',
      entityType: 'user',
      entityId: session.user.id,
      userId: session.user.id,
      severity: 'low',
      metadata,
    })
  },
)

// Addresses (read-only — keep manual)
export async function getAddressesAction() {
  const session = await requireAuth()
  return accountService.getAddresses(session.user.id)
}

export const createAddressAction = createSafeAction(
  { schema: addressFormSchema, auth: true },
  async ({ data, session, metadata }) => {
    enforceWriteLimit(session.user.id)

    const { id: _id, ...addressData } = data
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
  },
)

export const updateAddressAction = createSafeAction(
  { schema: addressFormSchema, auth: true },
  async ({ data, session, metadata }) => {
    enforceWriteLimit(session.user.id)

    if (!data.id) {
      throw new ValidationError('validation.addressIdRequired')
    }

    const { id, ...rest } = data
    await accountService.updateAddress(id, session.user.id, rest)

    await createAuditLog({
      action: 'address.updated',
      entityType: 'address',
      entityId: id,
      userId: session.user.id,
      metadata,
    })
  },
)

export const deleteAddressAction = createSafeAction(
  { schema: z.string(), auth: true },
  async ({ data: id, session, metadata }) => {
    enforceWriteLimit(session.user.id)

    await accountService.deleteAddress(id, session.user.id)

    await createAuditLog({
      action: 'address.deleted',
      entityType: 'address',
      entityId: id,
      userId: session.user.id,
      severity: 'high',
      metadata,
    })
  },
)

export const setDefaultAddressAction = createSafeAction(
  { schema: z.string(), auth: true },
  async ({ data: id, session, metadata }) => {
    enforceWriteLimit(session.user.id)

    await accountService.setDefaultAddress(id, session.user.id)

    await createAuditLog({
      action: 'address.set_default',
      entityType: 'address',
      entityId: id,
      userId: session.user.id,
      severity: 'low',
      metadata,
    })
  },
)
