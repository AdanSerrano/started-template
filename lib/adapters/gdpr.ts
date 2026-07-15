/**
 * GDPR adapter — exportacion y eliminacion de datos del usuario.
 */

import { eq } from 'drizzle-orm'
import {
  users,
  addresses,
  sessions,
  auditLogs,
  accounts,
  twoFactors,
  verifications,
} from '@/db/schema'
import { db } from '@/lib/db'
import type {
  IGDPRService,
  UserDataExport,
  DataCategory,
} from '@/lib/interfaces/gdpr.interface'

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
    // El email es la clave de las verifications (tokens pendientes).
    const [existing] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))

    await db.transaction(async (tx) => {
      // Revocar sesiones
      await tx.delete(sessions).where(eq(sessions.userId, userId))

      // Borrar credenciales: password hash + tokens OAuth (accounts) y secreto TOTP.
      // El soft-delete conserva la fila users, así que el ON DELETE CASCADE
      // nunca dispara; hay que borrar estas tablas explícitamente (RGPD).
      await tx.delete(accounts).where(eq(accounts.userId, userId))
      await tx.delete(twoFactors).where(eq(twoFactors.userId, userId))
      if (existing?.email) {
        await tx
          .delete(verifications)
          .where(eq(verifications.identifier, existing.email))
      }

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
