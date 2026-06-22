'use client'

import { Activity, CalendarCheck, AlertTriangle, Radio, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/lib/context/NotificationContext'
import type { Notification } from '@/lib/context/NotificationContext'
import { SlideOverPanel } from './SlideOverPanel'

function NotifIcon({ type }: { type: Notification['type'] }) {
  const Icon =
    type === 'activity'  ? Activity :
    type === 'follow-up' ? CalendarCheck :
    type === 'broadcast' ? Radio :
    AlertTriangle
  const color = type === 'alert' ? '#d97706' : '#c4a574'
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: 32,
        height: 32,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <Icon size={14} style={{ color }} />
    </div>
  )
}

export function NotificationPanel() {
  const { closeNotifications, markAllRead, unreadCount, notifications } = useNotifications()
  const router = useRouter()

  const newNotifs = notifications.filter(n => !n.read)
  const earlierNotifs = notifications.filter(n => n.read)

  function handleNotifClick(notif: Notification) {
    if (notif.entity_type === 'contact' && notif.entity_id) {
      closeNotifications()
      router.push(`/contacts/${notif.entity_id}`)
    }
  }

  return (
    <SlideOverPanel onClose={closeNotifications} width={360}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between"
        style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center" style={{ gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="flex items-center justify-center rounded-full font-semibold"
              style={{
                height: 20, minWidth: 20, paddingLeft: 6, paddingRight: 6,
                fontSize: 11, backgroundColor: '#c4a574', color: '#000000',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ fontSize: 12, color: '#c4a574', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              className="hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={closeNotifications}
            className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
            style={{ width: 32, height: 32, color: 'var(--muted)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {newNotifs.length > 0 && (
          <div>
            <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              New
            </div>
            {newNotifs.map((notif, i) => {
              const isLinked = notif.entity_type === 'contact' && !!notif.entity_id
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="flex items-center"
                  style={{ height: 64, padding: '0 20px', gap: 12, borderBottom: i < newNotifs.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)', cursor: isLinked ? 'pointer' : 'default' }}
                >
                  <NotifIcon type={notif.type} />
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 2 }}>
                    <span className="truncate" style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{notif.message}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{notif.timestamp}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {earlierNotifs.length > 0 && (
          <div>
            <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Earlier
            </div>
            {earlierNotifs.map((notif, i) => {
              const isLinked = notif.entity_type === 'contact' && !!notif.entity_id
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="flex items-center"
                  style={{ height: 64, padding: '0 20px', gap: 12, borderBottom: i < earlierNotifs.length - 1 ? '1px solid var(--border)' : 'none', cursor: isLinked ? 'pointer' : 'default' }}
                >
                  <NotifIcon type={notif.type} />
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 2 }}>
                    <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>{notif.message}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{notif.timestamp}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SlideOverPanel>
  )
}
