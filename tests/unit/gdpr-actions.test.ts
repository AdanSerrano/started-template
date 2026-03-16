/**
 * Unit tests for GDPR actions.
 *
 * Tests exportMyDataAction and deleteMyAccountAction.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSession } from '../factories/session.factory'

// Mock env + db (prevent DATABASE_URL requirement)
vi.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost/test',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    APP_URL: 'http://localhost:3000',
    RESEND_API_KEY: '',
  },
}))
vi.mock('@/lib/db', () => ({
  db: {},
}))

// Mock auth
const mockSession = createMockSession()
vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue(mockSession),
}))

// Mock audit
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi.fn().mockResolvedValue({
    ip: '127.0.0.1',
    userAgent: 'test',
  }),
}))

// Mock GDPR service
const mockGDPRService = {
  exportUserData: vi.fn(),
  deleteUserData: vi.fn(),
  getDataCategories: vi.fn(),
}

vi.mock('@/lib/providers', () => ({
  getGDPRService: () => mockGDPRService,
}))

describe('GDPR Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportMyDataAction', () => {
    it('should export user data and return success', async () => {
      const exportPayload = {
        userId: mockSession.user.id,
        exportDate: new Date().toISOString(),
        categories: [
          {
            category: 'profile',
            data: [
              { name: mockSession.user.name, email: mockSession.user.email },
            ],
          },
        ],
      }
      mockGDPRService.exportUserData.mockResolvedValue(exportPayload)

      const { exportMyDataAction } =
        await import('@/modules/account/actions/gdpr-actions')

      const result = await exportMyDataAction()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(exportPayload)
    })

    it('should call gdprService.exportUserData with session user id', async () => {
      mockGDPRService.exportUserData.mockResolvedValue({
        userId: mockSession.user.id,
        exportDate: '',
        categories: [],
      })

      const { exportMyDataAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await exportMyDataAction()

      expect(mockGDPRService.exportUserData).toHaveBeenCalledWith(
        mockSession.user.id,
      )
    })

    it('should create audit log with gdpr.data_exported action', async () => {
      mockGDPRService.exportUserData.mockResolvedValue({
        userId: mockSession.user.id,
        exportDate: '',
        categories: [],
      })
      const { createAuditLog } = await import('@/lib/audit')

      const { exportMyDataAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await exportMyDataAction()

      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'gdpr.data_exported',
          entityType: 'user',
          entityId: mockSession.user.id,
          userId: mockSession.user.id,
          severity: 'medium',
          metadata: { ip: '127.0.0.1', userAgent: 'test' },
        }),
      )
    })

    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/auth-server')

      const { exportMyDataAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await exportMyDataAction()

      expect(requireAuth).toHaveBeenCalled()
    })

    it('should propagate error when gdprService throws', async () => {
      mockGDPRService.exportUserData.mockRejectedValue(
        new Error('Export failed'),
      )

      const { exportMyDataAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await expect(exportMyDataAction()).rejects.toThrow('Export failed')
    })
  })

  describe('deleteMyAccountAction', () => {
    it('should delete account when confirmation is DELETE', async () => {
      mockGDPRService.deleteUserData.mockResolvedValue(undefined)

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      const result = await deleteMyAccountAction('DELETE')

      expect(result.success).toBe(true)
    })

    it('should call gdprService.deleteUserData with session user id', async () => {
      mockGDPRService.deleteUserData.mockResolvedValue(undefined)

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await deleteMyAccountAction('DELETE')

      expect(mockGDPRService.deleteUserData).toHaveBeenCalledWith(
        mockSession.user.id,
      )
    })

    it('should return error when confirmation is not DELETE', async () => {
      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      const result = await deleteMyAccountAction('delete')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes escribir DELETE para confirmar')
    })

    it('should not call gdprService when confirmation is wrong', async () => {
      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await deleteMyAccountAction('wrong')

      expect(mockGDPRService.deleteUserData).not.toHaveBeenCalled()
    })

    it('should not create audit log when confirmation is wrong', async () => {
      const { createAuditLog } = await import('@/lib/audit')

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await deleteMyAccountAction('nope')

      expect(createAuditLog).not.toHaveBeenCalled()
    })

    it('should return error for empty confirmation', async () => {
      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      const result = await deleteMyAccountAction('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes escribir DELETE para confirmar')
    })

    it('should create audit log with critical severity before deleting', async () => {
      mockGDPRService.deleteUserData.mockResolvedValue(undefined)
      const { createAuditLog } = await import('@/lib/audit')

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await deleteMyAccountAction('DELETE')

      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'gdpr.account_deleted',
          entityType: 'user',
          entityId: mockSession.user.id,
          userId: mockSession.user.id,
          severity: 'critical',
          metadata: { ip: '127.0.0.1', userAgent: 'test' },
        }),
      )
    })

    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/auth-server')

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await deleteMyAccountAction('DELETE')

      expect(requireAuth).toHaveBeenCalled()
    })

    it('should propagate error when gdprService.deleteUserData throws', async () => {
      mockGDPRService.deleteUserData.mockRejectedValue(
        new Error('Deletion failed'),
      )

      const { deleteMyAccountAction } =
        await import('@/modules/account/actions/gdpr-actions')

      await expect(deleteMyAccountAction('DELETE')).rejects.toThrow(
        'Deletion failed',
      )
    })
  })
})
