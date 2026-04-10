import { api } from './client'

export interface ApiNotification {
  id: string
  type: string
  message: string
  entity_type: string
  entity_id: string
  read: boolean
  created_at: string
}

export async function getNotifications(): Promise<{ items: ApiNotification[]; unread_count: number }> {
  return api.get('/notifications/')
}

export async function markRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`, {})
}

export async function markAllRead(): Promise<void> {
  await api.patch('/notifications/read-all', {})
}
