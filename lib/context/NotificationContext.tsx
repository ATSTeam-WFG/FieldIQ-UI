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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  useEffect(() => {
    if (!hasToken()) return
    getNotifications()
      .then(({ items }) => {
        setNotifications(items.map(n => ({
          id: n.id,
          type: n.type as Notification['type'],
          message: n.message,
          timestamp: n.created_at,
          read: n.read,
        })))
      })
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  function addNotification(n: Omit<Notification, 'id' | 'read'>) {
    setNotifications(prev => [
      { ...n, id: `n-${Date.now()}`, read: false },
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
