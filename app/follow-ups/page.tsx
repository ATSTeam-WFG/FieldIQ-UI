'use client'

import { useState, useRef } from 'react'
import { Plus, Circle, CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { SkeletonRows } from '@/components/fieldiq/SkeletonRows'
import { useActivityLog } from '@/lib/context/ActivityLogContext'
import { useFollowUps, useUpdateFollowUp } from '@/lib/hooks/useFollowUps'
import type { FollowUp } from '@/lib/api/follow-ups'

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MIN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM – 7 PM
const GUTTER = 52   // px — time label column width
const SLOT_H = 52   // px per hour slot

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  r.setDate(d.getDate() - d.getDay())
  r.setHours(0, 0, 0, 0)
  return r
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatHour(h: number): string {
  if (h === 12) return '12 PM'
  return h > 12 ? `${h - 12} PM` : `${h} AM`
}

// ── View types & range logic ──────────────────────────────────────────────────

type ViewMode = 'month' | 'week' | 'day'

function getRange(cursor: Date, viewMode: ViewMode): { start: Date; end: Date } {
  const c = new Date(cursor); c.setHours(0, 0, 0, 0)
  if (viewMode === 'month') {
    const start = new Date(c.getFullYear(), c.getMonth(), 1)
    const end = new Date(c.getFullYear(), c.getMonth() + 1, 0); end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  if (viewMode === 'week') {
    const start = startOfWeek(c)
    const end = addDays(start, 6); end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  const start = new Date(c)
  const end = new Date(c); end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatRangeLabel(cursor: Date, viewMode: ViewMode): string {
  if (viewMode === 'month') return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
  if (viewMode === 'week') {
    const s = startOfWeek(cursor)
    const e = addDays(s, 6)
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  return cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatNavLabel(cursor: Date, viewMode: ViewMode): string {
  if (viewMode === 'month') return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
  if (viewMode === 'week') return `${MONTH_SHORT[startOfWeek(cursor).getMonth()]} ${cursor.getFullYear()}`
  return `${MONTH_SHORT[cursor.getMonth()]} ${cursor.getFullYear()}`
}

// ── Calendar URL helpers ──────────────────────────────────────────────────────

function buildGoogleCalendarUrl(item: FollowUp): string {
  if (!item.due_date) return ''
  const d = parseDate(item.due_date)
  const pad = (n: number) => String(n).padStart(2, '0')
  const ds = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Follow-up: ${item.contact?.name ?? 'Contact'}`)}&dates=${ds}/${ds}&details=${encodeURIComponent(item.note ?? '')}`
}

function buildOutlookCalendarUrl(item: FollowUp): string {
  if (!item.due_date) return ''
  return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(`Follow-up: ${item.contact?.name ?? 'Contact'}`)}&startdt=${item.due_date}&enddt=${item.due_date}&body=${encodeURIComponent(item.note ?? '')}`
}

// ── CalendarDropdown ──────────────────────────────────────────────────────────

function CalendarDropdown({ item }: { item: FollowUp }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Add to calendar"
        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--muted)' }}
      >
        <CalendarPlus size={13} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 50, backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 180, overflow: 'hidden' }}>
            {[
              { label: 'Google Calendar', bg: '#4285F4', letter: 'G', url: buildGoogleCalendarUrl(item) },
              { label: 'Outlook Calendar', bg: '#0078D4', letter: 'O', url: buildOutlookCalendarUrl(item) },
            ].map(opt => (
              <button key={opt.label}
                onClick={() => { window.open(opt.url, '_blank'); setOpen(false) }}
                style={{ width: '100%', height: 36, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 12, fontSize: 13, backgroundColor: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ width: 16, height: 16, borderRadius: 2, backgroundColor: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{opt.letter}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── FollowUpRow ───────────────────────────────────────────────────────────────

function FollowUpRow({ item, isLast }: { item: FollowUp; isLast: boolean }) {
  const initial = (item.status === 'completed' || item.status === 'complete') ? 'done'
    : item.status === 'cancelled' ? 'cancelled' : 'pending'
  const [status, setStatus] = useState<'pending' | 'done' | 'cancelled'>(initial)
  const { mutate: updateFollowUp } = useUpdateFollowUp()

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <div className="flex items-center" style={{ minHeight: 60, padding: '10px 14px', gap: 10, opacity: status === 'done' ? 0.5 : status === 'cancelled' ? 0.4 : 1, transition: 'opacity 0.2s ease' }}>
        <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 26, height: 26, backgroundColor: 'var(--surface)' }}>
          <Circle size={11} style={{ color: 'var(--muted)' }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 1 }}>
          <span className="font-semibold truncate" style={{ fontSize: 13, color: 'var(--foreground)', textDecoration: status !== 'pending' ? 'line-through' : 'none' }}>
            {item.contact?.name ?? '—'}
          </span>
          {item.contact?.company && (
            <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>{item.contact.company}</span>
          )}
          {item.note && (
            <span className="truncate" style={{ fontSize: 11, color: 'var(--body)', fontStyle: 'italic' }}>{item.note}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap: 5 }}>
          {status === 'pending' ? (
            <>
              <CalendarDropdown item={item} />
              <button onClick={() => { setStatus('done'); updateFollowUp({ id: item.id, payload: { status: 'completed' } }) }}
                style={{ height: 26, paddingLeft: 8, paddingRight: 8, fontSize: 11, backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--foreground)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                Complete
              </button>
              <button onClick={() => { setStatus('cancelled'); updateFollowUp({ id: item.id, payload: { status: 'cancelled' } }) }}
                style={{ height: 26, paddingLeft: 8, paddingRight: 8, fontSize: 11, backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--muted)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : status === 'done' ? (
            <span style={{ fontSize: 11, color: '#16a34a', border: '1px solid #16a34a', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap' }}>Done ✓</span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap' }}>Cancelled</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Event chip (shared across calendar views) ─────────────────────────────────

function EventChip({ item, today }: { item: FollowUp; today: Date }) {
  const isOverdue = !!item.due_date && parseDate(item.due_date) < today
  return (
    <div style={{
      fontSize: 11, lineHeight: 1.3,
      backgroundColor: isOverdue ? 'rgba(217,119,6,0.14)' : 'rgba(196,165,116,0.12)',
      color: isOverdue ? '#d97706' : '#c4a574',
      borderLeft: `2px solid ${isOverdue ? '#d97706' : '#c4a574'}`,
      borderRadius: '0 3px 3px 0',
      padding: '2px 5px',
      marginBottom: 2,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {item.contact?.name ?? 'Follow-up'}
    </div>
  )
}

// ── MONTH VIEW ────────────────────────────────────────────────────────────────

function MonthView({
  cursor, followUps, selectedDay, today, onDayClick,
}: {
  cursor: Date; followUps: FollowUp[]; selectedDay: string | null; today: Date; onDayClick: (s: string) => void
}) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDOW = new Date(year, month, 1).getDay()
  const rows = Math.ceil((firstDOW + daysInMonth) / 7)

  const byDate = new Map<string, FollowUp[]>()
  for (const item of followUps) {
    if (!item.due_date) continue
    const arr = byDate.get(item.due_date) ?? []; arr.push(item); byDate.set(item.due_date, arr)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {DAY_LONG.map((d, i) => (
          <div key={d} style={{ padding: '10px 0', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        overflow: 'hidden',
      }}>
        {Array.from({ length: firstDOW }).map((_, i) => (
          <div key={`pad-${i}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', opacity: 0.4 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const cellDate = new Date(year, month, day)
          const dateStr = toDateStr(cellDate)
          const isToday = isSameDay(cellDate, today)
          const isSelected = selectedDay === dateStr
          const items = byDate.get(dateStr) ?? []
          const col = (firstDOW + i) % 7
          const isLastCol = col === 6

          return (
            <div
              key={day}
              onClick={() => onDayClick(dateStr)}
              style={{
                borderLeft: col > 0 ? '1px solid var(--border)' : 'none',
                borderBottom: '1px solid var(--border)',
                padding: '6px 8px',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'rgba(196,165,116,0.07)' : 'transparent',
                transition: 'background-color 0.12s ease',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {/* Day number */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <span style={{
                  width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', fontSize: 12,
                  fontWeight: isToday ? 700 : isSelected ? 600 : 400,
                  backgroundColor: isToday ? '#c4a574' : 'transparent',
                  color: isToday ? '#000' : isSelected ? '#c4a574' : 'var(--body)',
                }}>
                  {day}
                </span>
              </div>

              {/* Event chips */}
              {items.slice(0, 3).map(item => <EventChip key={item.id} item={item} today={today} />)}
              {items.length > 3 && (
                <div style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 3, marginTop: 1 }}>
                  +{items.length - 3} more
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── WEEK VIEW ─────────────────────────────────────────────────────────────────

function WeekView({
  cursor, followUps, selectedDay, today, onDayClick,
}: {
  cursor: Date; followUps: FollowUp[]; selectedDay: string | null; today: Date; onDayClick: (s: string) => void
}) {
  const weekStart = startOfWeek(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const byDate = new Map<string, FollowUp[]>()
  for (const item of followUps) {
    if (!item.due_date) continue
    const arr = byDate.get(item.due_date) ?? []; arr.push(item); byDate.set(item.due_date, arr)
  }

  const cols = `${GUTTER}px repeat(7, 1fr)`

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

      {/* Day header row */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div /> {/* gutter */}
        {days.map((d, i) => {
          const dateStr = toDateStr(d)
          const isToday = isSameDay(d, today)
          const isSelected = selectedDay === dateStr
          return (
            <button key={i} onClick={() => onDayClick(dateStr)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 4px', gap: 4, border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 500, color: isToday ? '#c4a574' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {DAY_SHORT[d.getDay()]}
              </span>
              <span style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', fontSize: 16, fontWeight: 700,
                backgroundColor: isToday ? '#c4a574' : 'transparent',
                color: isToday ? '#000' : isSelected ? '#c4a574' : 'var(--foreground)',
              }}>
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* All-day row */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 6, paddingBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>All day</span>
        </div>
        {days.map((d, i) => {
          const items = byDate.get(toDateStr(d)) ?? []
          return (
            <div key={i} style={{ padding: '4px 5px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none', minHeight: 32 }}>
              {items.map(item => <EventChip key={item.id} item={item} today={today} />)}
            </div>
          )
        })}
      </div>

      {/* Time grid (scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {HOURS.map(h => (
          <div key={h} style={{ display: 'grid', gridTemplateColumns: cols, height: SLOT_H, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{formatHour(h)}</span>
            </div>
            {days.map((_, i) => (
              <div key={i} style={{ borderLeft: i > 0 ? '1px solid var(--border)' : 'none', borderTop: '1px solid var(--border)' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DAY VIEW ──────────────────────────────────────────────────────────────────

function DayView({
  cursor, followUps, today,
}: {
  cursor: Date; followUps: FollowUp[]; today: Date
}) {
  const dateStr = toDateStr(cursor)
  const dayItems = followUps.filter(i => i.due_date === dateStr)
  const isToday = isSameDay(cursor, today)
  const now = new Date()
  const currentMins = isToday ? now.getHours() * 60 + now.getMinutes() : null
  const START_MINS = 7 * 60
  const indicatorTop = currentMins !== null && currentMins >= START_MINS
    ? ((currentMins - START_MINS) / 60) * SLOT_H
    : null

  const cols = `${GUTTER}px 1fr`

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? '#c4a574' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {DAY_LONG[cursor.getDay()]}
        </span>
        <span style={{
          width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', fontSize: 20, fontWeight: 700,
          backgroundColor: isToday ? '#c4a574' : 'transparent',
          color: isToday ? '#000' : 'var(--foreground)',
        }}>
          {cursor.getDate()}
        </span>
      </div>

      {/* All-day row */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 6, paddingBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>All day</span>
        </div>
        <div style={{ padding: '4px 8px', minHeight: 36 }}>
          {dayItems.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>No follow-ups</span>
          ) : (
            dayItems.map(item => (
              <div key={item.id} style={{
                fontSize: 12,
                backgroundColor: 'rgba(196,165,116,0.12)',
                color: '#c4a574',
                borderLeft: '2px solid #c4a574',
                borderRadius: '0 4px 4px 0',
                padding: '4px 10px',
                marginBottom: 3,
              }}>
                <span style={{ fontWeight: 600 }}>{item.contact?.name ?? 'Follow-up'}</span>
                {item.contact?.company && <span style={{ color: 'var(--muted)' }}> — {item.contact.company}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Time grid (scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          {HOURS.map(h => (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: cols, height: SLOT_H }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{formatHour(h)}</span>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', borderTop: '1px solid var(--border)' }} />
            </div>
          ))}

          {/* Current time indicator */}
          {indicatorTop !== null && (
            <div style={{ position: 'absolute', left: GUTTER, right: 0, top: indicatorTop, zIndex: 2, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#c4a574', flexShrink: 0, marginLeft: -5 }} />
              <div style={{ flex: 1, height: 2, backgroundColor: '#c4a574' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const { openLog } = useActivityLog()
  const { data, isLoading } = useFollowUps({ page_size: 100 })

  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState<Date>(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const allItems = data?.items ?? []
  const pendingItems = allItems.filter(i => i.status === 'pending' || i.status === 'follow_up')
  const overdueItems = pendingItems.filter(i => i.due_date && parseDate(i.due_date) < today)

  const range = getRange(cursor, viewMode)
  const inRangeItems = pendingItems.filter(i => {
    if (!i.due_date) return false
    const d = parseDate(i.due_date)
    return d >= today && d >= range.start && d <= range.end
  })

  const groupedByDate = new Map<string, FollowUp[]>()
  for (const item of inRangeItems) {
    if (!item.due_date) continue
    const arr = groupedByDate.get(item.due_date) ?? []; arr.push(item); groupedByDate.set(item.due_date, arr)
  }
  const sortedDateKeys = Array.from(groupedByDate.keys()).sort()

  const kpiLabel = viewMode === 'month' ? 'THIS MONTH' : viewMode === 'week' ? 'THIS WEEK' : 'TODAY'

  function navigate(dir: -1 | 1) {
    setCursor(prev => {
      const d = new Date(prev)
      if (viewMode === 'month') d.setMonth(d.getMonth() + dir)
      else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7)
      else d.setDate(d.getDate() + dir)
      return d
    })
    setSelectedDay(null)
  }

  function goToday() {
    const d = new Date(); d.setHours(0, 0, 0, 0)
    setCursor(d)
    const str = toDateStr(d)
    setSelectedDay(str)
    setTimeout(() => document.getElementById(`group-${str}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  function handleDayClick(dateStr: string) {
    if (viewMode === 'day') {
      setCursor(parseDate(dateStr))
    } else {
      setSelectedDay(prev => prev === dateStr ? null : dateStr)
      setTimeout(() => document.getElementById(`group-${dateStr}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }

  function switchView(mode: ViewMode) { setViewMode(mode); setSelectedDay(null) }

  return (
    <AppShell activeItem="Follow-ups">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 56px - 64px)' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.2, margin: 0 }}>Follow-ups</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4, marginBottom: 0 }}>
              {isLoading ? 'Loading…' : `${pendingItems.length} pending · ${overdueItems.length} overdue`}
            </p>
          </div>
          <button
            onClick={openLog}
            className="flex shrink-0 items-center gap-1.5 rounded-[8px] font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{ height: 44, paddingLeft: 20, paddingRight: 20, fontSize: 14, backgroundColor: '#c4a574', color: '#000', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} color="#000" />
            Log Activity
          </button>
        </div>

        {/* Split layout */}
        <div style={{ display: 'flex', flex: 1, gap: 16, minHeight: 0, alignItems: 'stretch' }}>

          {/* ── LEFT: Calendar Panel (62%) ─────────────────────────── */}
          <div
            className="fieldiq-card"
            style={{ flex: '0 0 62%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
          >
            {/* Calendar header: view switcher + nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}>

              {/* View switcher */}
              <div style={{ display: 'flex', backgroundColor: 'var(--surface)', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                  <button key={mode} onClick={() => switchView(mode)}
                    style={{
                      height: 30, paddingLeft: 14, paddingRight: 14, fontSize: 12, borderRadius: 6, border: 'none',
                      fontWeight: viewMode === mode ? 600 : 400,
                      backgroundColor: viewMode === mode ? 'var(--card)' : 'transparent',
                      color: viewMode === mode ? 'var(--foreground)' : 'var(--muted)',
                      boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer', transition: 'all 0.12s ease', textTransform: 'capitalize',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => navigate(-1)}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', backgroundColor: 'transparent', borderRadius: 6, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <ChevronLeft size={15} style={{ color: 'var(--muted)' }} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', minWidth: 130, textAlign: 'center' }}>
                  {formatNavLabel(cursor, viewMode)}
                </span>
                <button onClick={() => navigate(1)}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', backgroundColor: 'transparent', borderRadius: 6, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <ChevronRight size={15} style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              {/* Today button */}
              <button onClick={goToday}
                style={{ height: 30, paddingLeft: 14, paddingRight: 14, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'transparent', color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c4a574'; e.currentTarget.style.borderColor = '#c4a574' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                Today
              </button>
            </div>

            {/* Calendar body */}
            {viewMode === 'month' && (
              <MonthView cursor={cursor} followUps={pendingItems} selectedDay={selectedDay} today={today} onDayClick={handleDayClick} />
            )}
            {viewMode === 'week' && (
              <WeekView cursor={cursor} followUps={pendingItems} selectedDay={selectedDay} today={today} onDayClick={handleDayClick} />
            )}
            {viewMode === 'day' && (
              <DayView cursor={cursor} followUps={pendingItems} today={today} />
            )}
          </div>

          {/* ── RIGHT: List Panel (38%) ────────────────────────────── */}
          <div ref={listRef} style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', minHeight: 0 }}>

            {/* Range label */}
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', margin: 0, flexShrink: 0 }}>
              {formatRangeLabel(cursor, viewMode)}
            </h2>

            {/* KPI strip */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              {[
                { label: 'OVERDUE', value: overdueItems.length, color: '#d97706' },
                { label: kpiLabel, value: inRangeItems.length, color: '#c4a574' },
                { label: 'ALL PENDING', value: pendingItems.length, color: 'var(--muted)' },
              ].map(kpi => (
                <div key={kpi.label} style={{ flex: 1, backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderTop: '2px solid #c4a574', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{kpi.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</span>
                </div>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="fieldiq-card"><SkeletonRows cols={3} rows={5} /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Overdue — always visible */}
                {overdueItems.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', backgroundColor: 'var(--surface)', padding: '1px 7px', borderRadius: 99 }}>{overdueItems.length}</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderTop: '2px solid #d97706', borderRadius: 8, overflow: 'hidden' }}>
                      {overdueItems.map((item, idx) => <FollowUpRow key={item.id} item={item} isLast={idx === overdueItems.length - 1} />)}
                    </div>
                  </div>
                )}

                {/* Date groups */}
                {sortedDateKeys.map(dateStr => {
                  const items = groupedByDate.get(dateStr)!
                  const isHighlighted = selectedDay === dateStr
                  return (
                    <div key={dateStr} id={`group-${dateStr}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isHighlighted ? '#c4a574' : 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.15s' }}>
                          {parseDate(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', backgroundColor: 'var(--surface)', padding: '1px 7px', borderRadius: 99 }}>{items.length}</span>
                      </div>
                      <div style={{ backgroundColor: 'var(--card)', border: `1px solid ${isHighlighted ? '#c4a574' : 'var(--border)'}`, borderTop: '2px solid #c4a574', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                        {items.map((item, idx) => <FollowUpRow key={item.id} item={item} isLast={idx === items.length - 1} />)}
                      </div>
                    </div>
                  )
                })}

                {/* Empty states */}
                {sortedDateKeys.length === 0 && overdueItems.length === 0 && (
                  <div className="fieldiq-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      No follow-ups for {viewMode === 'month' ? 'this month' : viewMode === 'week' ? 'this week' : 'today'}
                    </span>
                    <button onClick={openLog} style={{ fontSize: 13, color: '#c4a574', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Log an activity to schedule one
                    </button>
                  </div>
                )}
                {sortedDateKeys.length === 0 && overdueItems.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Nothing else scheduled for {viewMode === 'month' ? 'this month' : viewMode === 'week' ? 'this week' : 'today'}
                    </span>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
