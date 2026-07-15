/**
 * Unit tests for the GDPR adapter.
 *
 * Verifica que deleteUserData borra TODO lo que contiene datos personales o
 * credenciales: sessions, accounts (password hash + tokens OAuth),
 * twoFactors (secreto TOTP), verifications (tokens) y addresses.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as schema from '@/db/schema'

const captured = vi.hoisted(() => ({
  deleted: [] as unknown[],
  updated: [] as unknown[],
}))

vi.mock('@/lib/db', () => {
  const tx = {
    delete: (table: unknown) => {
      captured.deleted.push(table)
      return { where: () => Promise.resolve() }
    },
    update: (table: unknown) => {
      captured.updated.push(table)
      return { set: () => ({ where: () => Promise.resolve() }) }
    },
  }
  return {
    db: {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([{ email: 'user@example.com' }]),
        }),
      }),
      transaction: (cb: (t: typeof tx) => Promise<void>) => cb(tx),
    },
  }
})

describe('GDPRService.deleteUserData', () => {
  beforeEach(() => {
    captured.deleted = []
    captured.updated = []
  })

  it('deletes sessions, accounts, twoFactors, verifications and addresses', async () => {
    const { GDPRService } = await import('@/lib/adapters/gdpr')
    await new GDPRService().deleteUserData('u1')

    // Credenciales y PII: nada debe sobrevivir al "derecho al olvido".
    expect(captured.deleted).toContain(schema.sessions)
    expect(captured.deleted).toContain(schema.accounts)
    expect(captured.deleted).toContain(schema.twoFactors)
    expect(captured.deleted).toContain(schema.verifications)
    expect(captured.deleted).toContain(schema.addresses)
    // El usuario se anonimiza (soft-delete), no se borra la fila.
    expect(captured.updated).toContain(schema.users)
  })
})
