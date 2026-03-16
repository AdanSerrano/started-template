/**
 * In-app notification adapter (in-memory).
 *
 * Implementacion base para desarrollo.
 * Para produccion, reemplazar con DB-backed o servicio externo.
 */

import type {
  INotificationService,
  Notification,
  NotificationPayload,
} from '@/lib/interfaces/notification.interface'
import { randomUUID } from 'node:crypto'

export class InAppNotificationService implements INotificationService {
  private notifications: Map<string, Notification[]> = new Map()

  async send(payload: NotificationPayload): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId: payload.userId,
      title: payload.title,
      body: payload.body,
      channel: payload.channel ?? 'in_app',
      priority: payload.priority ?? 'normal',
      read: false,
      createdAt: new Date(),
    }
    if (payload.data) notification.data = payload.data
    if (payload.actionUrl) notification.actionUrl = payload.actionUrl

    const userNotifications = this.notifications.get(payload.userId) ?? []
    userNotifications.unshift(notification)
    this.notifications.set(payload.userId, userNotifications)

    return notification
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<Notification[]> {
    return Promise.all(payloads.map((p) => this.send(p)))
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) ?? []
    const notification = userNotifications.find((n) => n.id === id)
    if (notification) notification.read = true
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) ?? []
    userNotifications.forEach((n) => {
      n.read = true
    })
  }

  async getUnread(userId: string): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) ?? []
    return userNotifications.filter((n) => !n.read)
  }

  async getAll(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) ?? []
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50
    return userNotifications.slice(offset, offset + limit)
  }
}
