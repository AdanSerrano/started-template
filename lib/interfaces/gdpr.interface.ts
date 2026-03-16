/**
 * Interface para cumplimiento GDPR.
 * Exportacion y eliminacion de datos del usuario.
 */

export interface DataCategory {
  name: string
  description: string
  tables: string[]
}

export interface UserDataExport {
  userId: string
  exportDate: string
  categories: {
    category: string
    data: Record<string, unknown>[]
  }[]
}

export interface IGDPRService {
  exportUserData(userId: string): Promise<UserDataExport>
  deleteUserData(userId: string): Promise<void>
  getDataCategories(): DataCategory[]
}
