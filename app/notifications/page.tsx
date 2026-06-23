'use client'

import { ArrowLeft } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/lib/context/NotificationContext'
import { useActivityLog } from '@/lib/context/ActivityLogContext'
import { NotifRow } from '@/components/fieldiq/NotificationPanel'
import { LogActivityPanel } from '@/components/fieldiq/LogActivityPanel'

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications()
  const { openLog, isOpen: logOpen } = useActivityLog()

  const newNotifs     = notifications.filter(n => !n.read)
  const earlierNotifs = notifications.filter(n => n.read)

  function navigate(path: string) {
    router.push(path)
  }

  function logActivity() {
    openLog()
  }

  const rowProps = {
    onMarkRead: markRead,
    onNavigate: navigate,
    onLogActivity: logActivity,
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Only mount when open — same pattern as AppShell */}
      <AnimatePresence>{logOpen && <LogActivityPanel />}</AnimatePresence>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: 'none', backgroundColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--foreground)',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 20, minWidth: 20, paddingLeft: 6, paddingRight: 6,
              borderRadius: 10, fontSize: 11, fontWeight: 600,
              backgroundColor: '#c4a574', color: '#000',
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ fontSize: 13, color: '#c4a574', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {notifications.length === 0 && (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>No notifications yet.</p>
          </div>
        )}

        {newNotifs.length > 0 && (
          <div>
            <div style={{ padding: '14px 20px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              New
            </div>
            {newNotifs.map((notif, i) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                isLast={i === newNotifs.length - 1}
                isUnread
                {...rowProps}
              />
            ))}
          </div>
        )}

        {earlierNotifs.length > 0 && (
          <div>
            <div style={{ padding: '14px 20px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Earlier
            </div>
            {earlierNotifs.map((notif, i) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                isLast={i === earlierNotifs.length - 1}
                isUnread={false}
                {...rowProps}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
