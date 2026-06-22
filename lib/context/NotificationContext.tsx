'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getNotifications, markAllRead as apiMarkAllRead } from '@/lib/api/notifications'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export interface Notification {
  id: string
  type: 'activity' | 'follow-up' | 'alert' | 'broadcast'
  message: string
  timestamp: string
  read: boolean
  entity_type: string | null
  entity_id: string | null
}

const INITIAL_NOTIFICATIONS: Notification[] = []

interface NotificationContextValue {
  isOpen: boolean
  unreadCount: number
  notifications: Notification[]
  openNotifications: () => void
  closeNotifications: () => void
  markAllRead: () => void
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
}

const NotificationContext = createContext<NotificationContextValue>({
  isOpen: false,
  unreadCount: 3,
  notifications: INITIAL_NOTIFICATIONS,
  openNotifications: () => {},
  closeNotifications: () => {},
  markAllRead: () => {},
  addNotification: () => {},
})

function toFrontendType(t: string): Notification['type'] {
  if (t === 'activity') return 'activity'
  if (t === 'overdue_followup') return 'follow-up'
  if (t === 'broadcast') return 'broadcast'
  return 'alert'
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  useEffect(() => {
    if (!hasToken()) return
    getNotifications()
      .then(({ items }) => {
        setNotifications(items.map(n => ({
          id: n.id,
          type: toFrontendType(n.type),
          message: n.message,
          timestamp: n.created_at,
          read: n.read,
          entity_type: n.entity_type ?? null,
          entity_id: n.entity_id ?? null,
        })))
      })
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  function addNotification(n: Omit<Notification, 'id' | 'read' | 'entity_type' | 'entity_id'>) {
    setNotifications(prev => [
      { ...n, id: `n-${Date.now()}`, read: false, entity_type: null, entity_id: null },
      ...prev,
    ])
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await apiMarkAllRead()
    } catch {}
  }

  return (
    <NotificationContext.Provider
      value={{
        isOpen,
        unreadCount,
        notifications,
        openNotifications: () => setIsOpen(true),
        closeNotifications: () => setIsOpen(false),
        markAllRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
