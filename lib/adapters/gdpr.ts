/**
 * GDPR adapter — exportacion y eliminacion de datos del usuario.
 */

import type {
  IGDPRService,
  UserDataExport,
  DataCategory,
} from '@/lib/interfaces/gdpr.interface'
import { db } from '@/lib/db'
import { users, addresses, sessions, auditLogs } from '@/db/schema'
import { eq } from 'drizzle-orm'

const DATA_CATEGORIES: DataCategory[] = [
  {
    name: 'profile',
    description: 'Datos personales del perfil',
    tables: ['users'],
  },
  {
    name: 'addresses',
    description: 'Direcciones de envio y facturacion',
    tables: ['addresses'],
  },
  {
    name: 'sessions',
    description: 'Sesiones activas',
    tables: ['sessions'],
  },
  {
    name: 'audit_logs',
    description: 'Registro de actividad',
    tables: ['audit_logs'],
  },
]

export class GDPRService implements IGDPRService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const [userData, userAddresses, userSessions, userAuditLogs] =
      await Promise.all([
        db.select().from(users).where(eq(users.id, userId)),
        db.select().from(addresses).where(eq(addresses.userId, userId)),
        db.select().from(sessions).where(eq(sessions.userId, userId)),
        db.select().from(auditLogs).where(eq(auditLogs.userId, userId)),
      ])

    // Omitir campos sensibles del export
    const sanitizedUser = userData.map(({ ...user }) => {
      const { deletedBy: _d, ...rest } = user
      return rest
    })

    return {
      userId,
      exportDate: new Date().toISOString(),
      categories: [
        { category: 'profile', data: sanitizedUser },
        { category: 'addresses', data: userAddresses },
        {
          category: 'sessions',
          data: userSessions.map(({ token: _t, ...s }) => s),
        },
        { category: 'audit_logs', data: userAuditLogs },
      ],
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Revocar sesiones
      await tx.delete(sessions).where(eq(sessions.userId, userId))

      // Eliminar direcciones
      await tx.delete(addresses).where(eq(addresses.userId, userId))

      // Soft delete + anonimizar usuario
      await tx
        .update(users)
        .set({
          name: '[deleted]',
          email: `deleted-${userId}@removed.local`,
          phone: null,
          image: null,
          username: null,
          displayUsername: null,
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    })
  }

  getDataCategories(): DataCategory[] {
    return DATA_CATEGORIES
  }
}
