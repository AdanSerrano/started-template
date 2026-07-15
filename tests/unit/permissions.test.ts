/**
 * Unit tests for access control roles.
 * Verifica que cada rol autoriza EXACTAMENTE lo que debe — esto es una
 * frontera de seguridad (escalada de privilegios si se relaja).
 */

import { describe, it, expect } from 'vitest'
import { roles, superAdmin, adminRole, userRole } from '@/lib/permissions'

describe('access control roles', () => {
  describe('super_admin', () => {
    it('puede borrar e impersonar usuarios', () => {
      expect(superAdmin.authorize({ user: ['delete'] }).success).toBe(true)
      expect(superAdmin.authorize({ user: ['impersonate'] }).success).toBe(true)
      expect(superAdmin.authorize({ session: ['delete'] }).success).toBe(true)
    })
  })

  describe('admin', () => {
    it('gestiona la tienda pero NO borra ni impersona usuarios', () => {
      expect(adminRole.authorize({ user: ['ban'] }).success).toBe(true)
      expect(adminRole.authorize({ user: ['list'] }).success).toBe(true)
      expect(adminRole.authorize({ user: ['delete'] }).success).toBe(false)
      expect(adminRole.authorize({ user: ['impersonate'] }).success).toBe(false)
    })

    it('NO puede borrar sesiones (solo revocar)', () => {
      expect(adminRole.authorize({ session: ['revoke'] }).success).toBe(true)
      expect(adminRole.authorize({ session: ['delete'] }).success).toBe(false)
    })
  })

  describe('user', () => {
    it('solo lee catálogo y crea/lee sus pedidos', () => {
      expect(userRole.authorize({ order: ['create'] }).success).toBe(true)
      expect(userRole.authorize({ poster: ['read'] }).success).toBe(true)
    })

    it('NO puede acciones administrativas', () => {
      expect(userRole.authorize({ user: ['ban'] }).success).toBe(false)
      expect(userRole.authorize({ poster: ['delete'] }).success).toBe(false)
      expect(userRole.authorize({ settings: ['update'] }).success).toBe(false)
    })
  })

  it('roles expone las claves exactas del userRoleEnum', () => {
    expect(Object.keys(roles).sort()).toEqual(['admin', 'super_admin', 'user'])
  })
})
