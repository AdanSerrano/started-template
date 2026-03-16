/**
 * Interface para servicios de notificaciones.
 * Permite cambiar entre in-app, push, email, etc. sin tocar services.
 */

export type NotificationChannel = 'in_app' | 'email' | 'push'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationPayload {
  userId: string
  title: string
  body: string
  channel?: NotificationChannel
  priority?: NotificationPriority
  data?: Record<string, unknown>
  actionUrl?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  channel: NotificationChannel
  priority: NotificationPriority
  read: boolean
  data?: Record<string, unknown>
  actionUrl?: string
  createdAt: Date
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<Notification>
  sendBulk(payloads: NotificationPayload[]): Promise<Notification[]>
  markAsRead(id: string, userId: string): Promise<void>
  markAllAsRead(userId: string): Promise<void>
  getUnread(userId: string): Promise<Notification[]>
  getAll(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Notification[]>
}
