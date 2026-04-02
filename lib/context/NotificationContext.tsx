'use client'

import { createContext, useContext, useState } from 'react'

export interface Notification {
  id: string
  type: 'activity' | 'follow-up' | 'alert' | 'broadcast'
  message: string
  timestamp: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'activity',
    message: 'Marcus Webb logged a Lunch · $142',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'n-002',
    type: 'follow-up',
    message: 'Follow-up overdue: Jennifer Hartley',
    timestamp: '1 day ago',
    read: false,
  },
  {
    id: 'n-003',
    type: 'alert',
    message: 'Kevin Ross is below weekly target (4/7 activities)',
    timestamp: '2 days ago',
    read: false,
  },
  {
    id: 'n-004',
    type: 'activity',
    message: 'CE Class hosted — 14 attendees',
    timestamp: '4 days ago',
    read: true,
  },
  {
    id: 'n-005',
    type: 'activity',
    message: 'Brendan Mills: Quarterly lunch completed',
    timestamp: '5 days ago',
    read: true,
  },
]

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

  const unreadCount = notifications.filter(n => !n.read).length

  function addNotification(n: Omit<Notification, 'id' | 'read'>) {
    setNotifications(prev => [
      { ...n, id: `n-${Date.now()}`, read: false },
      ...prev,
    ])
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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
