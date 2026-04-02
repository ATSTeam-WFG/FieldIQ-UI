'use client'

import { useState } from 'react'
import { Plus, Utensils, Package, Star, Circle, Phone, Coffee, CalendarPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { useActivityLog } from '@/lib/context/ActivityLogContext'

// ── Types ──────────────────────────────────────────────────────────────────

interface FollowUpItem {
  id: string
  type: string
  contactName: string
  company: string
  date: string         // ISO date string
  spend: number
  followUpNote: string
}

// ── Static data (hardcoded, no import) ────────────────────────────────────

const ALL_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'act-001',
    type: 'Lunch',
    contactName: 'Marcus Webb',
    company: 'Peachtree Realty Group',
    date: '2026-03-11',
    spend: 142,
    followUpNote: 'Send CE class invite by Friday',
  },
  {
    id: 'act-005',
    type: 'Closing Gift',
    contactName: 'Jennifer Hartley',
    company: 'Hartley Homes',
    date: '2026-03-06',
    spend: 95,
    followUpNote: 'Send thank-you card',
  },
  {
    id: 'act-006',
    type: 'Lunch',
    contactName: 'Brendan Mills',
    company: 'Compass Real Estate – Atlanta',
    date: '2026-03-05',
    spend: 178,
    followUpNote: 'Confirm Q2 breakfast dates',
  },
  {
    id: 'act-008',
    type: 'Sponsorship',
    contactName: 'Event Sponsor',
    company: 'Buckhead Business Association',
    date: '2026-03-03',
    spend: 250,
    followUpNote: 'Connect with all 7 contacts on LinkedIn',
  },
  {
    id: 'act-fu-001',
    type: 'Call',
    contactName: 'Priya Nair',
    company: 'Nair & Associates',
    date: '2026-03-19',
    spend: 0,
    followUpNote: 'Check if deal closed successfully',
  },
  {
    id: 'act-fu-002',
    type: 'Coffee',
    contactName: 'Derek Okafor',
    company: 'Okafor Properties LLC',
    date: '2026-03-22',
    spend: 18,
    followUpNote: 'Send luxury endorsement overview packet',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

const TODAY = new Date(2026, 2, 17) // March 17, 2026
const WEEK_START = new Date(2026, 2, 10) // March 10, 2026

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateChip(str: string): string {
  const d = parseDate(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getGroup(item: FollowUpItem): 'overdue' | 'thisWeek' | 'upcoming' {
  const d = parseDate(item.date)
  if (d < WEEK_START) return 'overdue'
  if (d <= TODAY) return 'thisWeek'
  return 'upcoming'
}

const iconMap: Record<string, LucideIcon> = {
  Lunch: Utensils,
  'Closing Gift': Package,
  Sponsorship: Star,
  Call: Phone,
  Coffee: Coffee,
}

function getIcon(type: string): LucideIcon {
  return iconMap[type] ?? Circle
}

// ── Calendar URL helpers ────────────────────────────────────────────────────

function buildGoogleCalendarUrl(item: FollowUpItem): string {
  const d = parseDate(item.date)
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const title = encodeURIComponent(`Follow-up: ${item.contactName} (${item.type})`)
  const details = encodeURIComponent(item.followUpNote)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`
}

function buildOutlookCalendarUrl(item: FollowUpItem): string {
  const dateStr = item.date
  const subject = encodeURIComponent(`Follow-up: ${item.contactName} (${item.type})`)
  const body = encodeURIComponent(item.followUpNote)
  return `https://outlook.live.com/calendar/0/action/compose?subject=${subject}&startdt=${dateStr}&enddt=${dateStr}&body=${body}`
}

// ── CalendarDropdown subcomponent ──────────────────────────────────────────

function CalendarDropdown({ item }: { item: FollowUpItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="hidden sm:block" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        title="Add to calendar"
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 4,
          cursor: 'pointer',
          color: 'var(--muted)',
        }}
      >
        <CalendarPlus size={14} />
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              zIndex: 50,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 180,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => {
                window.open(buildGoogleCalendarUrl(item), '_blank')
                setOpen(false)
              }}
              style={{
                width: '100%',
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 13,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--foreground)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 2,
                  backgroundColor: '#4285F4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#fff',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                G
              </span>
              Google Calendar
            </button>

            <button
              onClick={() => {
                window.open(buildOutlookCalendarUrl(item), '_blank')
                setOpen(false)
              }}
              style={{
                width: '100%',
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 13,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--foreground)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 2,
                  backgroundColor: '#0078D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#fff',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                O
              </span>
              Outlook Calendar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Subcomponents ──────────────────────────────────────────────────────────

interface FollowUpRowProps {
  item: FollowUpItem
  isLast: boolean
}

function FollowUpRow({ item, isLast }: FollowUpRowProps) {
  const [status, setStatus] = useState<'pending' | 'done' | 'cancelled'>('pending')
  const Icon = getIcon(item.type)

  const opacity = status === 'done' ? 0.5 : status === 'cancelled' ? 0.4 : 1

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center"
        style={{
          minHeight: 72,
          padding: '14px 20px',
          gap: 12,
          opacity,
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* Icon circle */}
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'var(--surface)',
          }}
        >
          <Icon size={14} style={{ color: 'var(--muted)' }} />
        </div>

        {/* Type label */}
        <div
          className="shrink-0 hidden sm:block"
          style={{ width: 100, fontSize: 13, color: 'var(--body)' }}
        >
          {item.type}
        </div>

        {/* Contact / company / note */}
        <div
          className="flex min-w-0 flex-1 flex-col justify-center"
          style={{ gap: 2 }}
        >
          <span
            className="font-semibold truncate"
            style={{
              fontSize: 14,
              color: 'var(--foreground)',
              textDecoration: status !== 'pending' ? 'line-through' : 'none',
            }}
          >
            {item.contactName}
          </span>
          <span
            className="truncate"
            style={{ fontSize: 11, color: 'var(--muted)' }}
          >
            {item.company}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: 13,
              color: 'var(--body)',
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            {item.followUpNote}
          </span>
        </div>

        {/* Right side: date chip + calendar + action buttons */}
        <div
          className="flex shrink-0 items-center"
          style={{ gap: 8 }}
        >
          {/* Date chip */}
          <span
            className="rounded hidden sm:block"
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              backgroundColor: 'var(--surface)',
              padding: '3px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            {formatDateChip(item.date)}
          </span>

          {status === 'pending' ? (
            <>
              {/* Calendar dropdown */}
              <CalendarDropdown item={item} />

              {/* Mark Complete */}
              <button
                onClick={() => setStatus('done')}
                style={{
                  height: 32,
                  paddingLeft: 10,
                  paddingRight: 10,
                  fontSize: 13,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--foreground)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                }}
              >
                Mark Complete
              </button>

              {/* Cancel */}
              <button
                onClick={() => setStatus('cancelled')}
                style={{
                  height: 32,
                  paddingLeft: 10,
                  paddingRight: 10,
                  fontSize: 13,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--muted)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                Cancel
              </button>
            </>
          ) : status === 'done' ? (
            <span
              style={{
                fontSize: 12,
                color: '#16a34a',
                border: '1px solid #16a34a',
                borderRadius: 4,
                padding: '3px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              Done ✓
            </span>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '3px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              Cancelled
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface GroupSectionProps {
  label: string
  items: FollowUpItem[]
  isOverdue?: boolean
}

function GroupSection({ label, items, isOverdue }: GroupSectionProps) {
  return (
    <div style={{ marginTop: 32 }}>
      {/* Section header */}
      <div
        className="flex items-center"
        style={{ gap: 8, marginBottom: 12 }}
      >
        {isOverdue && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#d97706',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        )}
        <span
          className="font-bold"
          style={{ fontSize: 13, color: 'var(--foreground)' }}
        >
          {label}
        </span>
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            backgroundColor: 'var(--surface)',
            padding: '1px 8px',
            borderRadius: 99,
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderTop: '2px solid #c4a574',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {items.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: 24 }}
          >
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {label === 'Upcoming'
                ? 'No upcoming follow-ups'
                : `Nothing here`}
            </span>
          </div>
        ) : (
          items.map((item, idx) => (
            <FollowUpRow
              key={item.id}
              item={item}
              isLast={idx === items.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const { openLog } = useActivityLog()

  const overdue = ALL_FOLLOW_UPS.filter(i => getGroup(i) === 'overdue')
  const thisWeek = ALL_FOLLOW_UPS.filter(i => getGroup(i) === 'thisWeek')
  const upcoming = ALL_FOLLOW_UPS.filter(i => getGroup(i) === 'upcoming')

  return (
    <AppShell activeItem="Follow-ups">
      <div className="flex flex-col" style={{ gap: 0 }}>

        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col" style={{ gap: 4 }}>
            <h1
              className="font-semibold leading-tight"
              style={{ fontSize: 22, color: 'var(--foreground)' }}
            >
              Follow-ups
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              {overdue.length + thisWeek.length + upcoming.length} pending · {overdue.length} overdue
            </p>
          </div>

          {/* Log Activity button */}
          <button
            onClick={openLog}
            className="flex shrink-0 items-center gap-1.5 rounded-[8px] font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              height: 44,
              paddingLeft: 20,
              paddingRight: 20,
              fontSize: 14,
              backgroundColor: '#c4a574',
              color: '#000000',
            }}
          >
            <Plus size={14} color="#000000" />
            Log Activity
          </button>
        </div>

        {/* ── KPI strip ───────────────────────────────────── */}
        <div
          className="flex"
          style={{ gap: 16, marginTop: 16 }}
        >
          {/* Overdue */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Overdue
            </span>
            <span
              className="font-bold"
              style={{ fontSize: 24, color: '#d97706', lineHeight: 1 }}
            >
              {overdue.length}
            </span>
          </div>

          {/* This Week */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              This Week
            </span>
            <span
              className="font-bold"
              style={{ fontSize: 24, color: '#c4a574', lineHeight: 1 }}
            >
              {thisWeek.length}
            </span>
          </div>

          {/* Upcoming */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Upcoming
            </span>
            <span
              className="font-bold"
              style={{ fontSize: 24, color: 'var(--muted)', lineHeight: 1 }}
            >
              {upcoming.length}
            </span>
          </div>
        </div>

        {/* ── Grouped sections ────────────────────────────── */}
        <GroupSection label="Overdue" items={overdue} isOverdue />
        <GroupSection label="This Week" items={thisWeek} />
        <GroupSection label="Upcoming" items={upcoming} />

      </div>
    </AppShell>
  )
}
