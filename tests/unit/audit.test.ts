// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/db/schema', () => ({
  auditLogs: {},
}))

const mockValues = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/db', () => {
  return {
    db: {
      insert: (...args: unknown[]) => {
        mockInsert(...args)
        return { values: mockValues }
      },
    },
  }
})

import { createAuditLog } from '@/lib/audit'

describe('createAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValues.mockResolvedValue(undefined)
  })

  it('calls db.insert with correct params', async () => {
    await createAuditLog({
      action: 'user.created',
      entityType: 'user',
      entityId: 'user-1',
      userId: 'admin-1',
      severity: 'high',
      description: 'Created a user',
      metadata: { ip: '127.0.0.1', userAgent: 'test' },
    })
    expect(mockInsert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalledWith({
      action: 'user.created',
      entityType: 'user',
      entityId: 'user-1',
      userId: 'admin-1',
      changes: undefined,
      severity: 'high',
      description: 'Created a user',
      metadata: { ip: '127.0.0.1', userAgent: 'test' },
    })
  })

  it('uses medium as default severity', async () => {
    await createAuditLog({
      action: 'item.updated',
      entityType: 'item',
    })
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'medium' }),
    )
  })

  it('does not throw when db.insert fails (fire-and-forget)', async () => {
    mockValues.mockRejectedValueOnce(new Error('DB connection lost'))
    await expect(
      createAuditLog({
        action: 'item.deleted',
        entityType: 'item',
        entityId: 'item-1',
      }),
    ).resolves.toBeUndefined()
  })

  it('passes metadata through', async () => {
    const metadata = { ip: '10.0.0.1', userAgent: 'Mozilla', extra: 'data' }
    await createAuditLog({
      action: 'order.placed',
      entityType: 'order',
      metadata,
    })
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
    )
  })

  it('defaults metadata to empty object when not provided', async () => {
    await createAuditLog({
      action: 'test.action',
      entityType: 'test',
    })
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: {} }),
    )
  })

  it('passes changes when provided', async () => {
    const changes = {
      before: { name: 'Old' },
      after: { name: 'New' },
    }
    await createAuditLog({
      action: 'item.updated',
      entityType: 'item',
      entityId: 'item-1',
      changes,
    })
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ changes }),
    )
  })
})
