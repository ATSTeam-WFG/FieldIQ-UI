'use client'

import { useState, useEffect } from 'react'
import type { ActivityDayItem, Period } from '@/lib/api/analytics'

function useWindowWidth() {
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return width
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GUTTER = 28  // px — left column for day labels

const CELL: Record<Period, { size: number; gap: number }> = {
  mtd: { size: 16, gap: 3 },
  qtd: { size: 13, gap: 2 },
  ytd: { size: 17, gap: 2 },
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getPeriodStart(period: Period, today: Date): Date {
  const d = new Date(today)
  d.setHours(0, 0, 0, 0)
  if (period === 'mtd') {
    d.setDate(1)
  } else if (period === 'qtd') {
    d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1)
  } else {
    d.setMonth(0, 1)
  }
  return d
}

function cellColor(count: number, inRange: boolean): string {
  if (!inRange) return 'transparent'
  if (count === 0) return 'var(--surface)'
  if (count === 1) return 'rgba(196,165,116,0.25)'
  if (count === 2) return 'rgba(196,165,116,0.55)'
  if (count === 3) return 'rgba(196,165,116,0.80)'
  return '#c4a574'
}

interface DayCell {
  date: Date
  dateStr: string
  count: number
  inRange: boolean
}

function buildWeeks(period: Period, today: Date, countMap: Map<string, number>): DayCell[][] {
  const todayNorm = new Date(today)
  todayNorm.setHours(0, 0, 0, 0)
  const periodStart = getPeriodStart(period, todayNorm)

  const gridStart = new Date(periodStart)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())

  const weeks: DayCell[][] = []
  const cur = new Date(gridStart)

  while (cur <= todayNorm) {
    const week: DayCell[] = []
    for (let dow = 0; dow < 7; dow++) {
      const d = new Date(cur)
      d.setDate(d.getDate() + dow)
      const dateStr = toDateStr(d)
      const inRange = d >= periodStart && d <= todayNorm
      week.push({ date: d, dateStr, count: countMap.get(dateStr) ?? 0, inRange })
    }
    weeks.push(week)
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: ActivityDayItem[]
  period: Period
  isLoading?: boolean
}

export function ActivityHeatmap({ data, period, isLoading }: Props) {
  const today = new Date()
  const { size: desktopCellSize, gap } = CELL[period]
  const countMap = new Map(data.map(d => [d.date, d.count]))
  const weeks = buildWeeks(period, today, countMap)
  const totalActivities = data.reduce((s, d) => s + d.count, 0)

  // On mobile, shrink cells to fit without horizontal scrolling.
  // Approximation: windowWidth - 64px accounts for AppShell padding (32px) + card content padding (32px).
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 768
  const cellSize = isMobile
    ? Math.max(Math.floor((windowWidth - 64 - GUTTER - (weeks.length - 1) * gap) / weeks.length), 6)
    : desktopCellSize

  let lastMonth = -1
  const monthSlots: string[] = weeks.map(week => {
    const firstInRange = week.find(c => c.inRange)
    if (!firstInRange) return ''
    const m = firstInRange.date.getMonth()
    if (m !== lastMonth) { lastMonth = m; return MONTH_NAMES[m] }
    return ''
  })

  const gridCols = `${GUTTER}px repeat(${weeks.length}, ${cellSize}px)`

  return (
    <div className="app-card" style={{ overflow: 'hidden', minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>
          Activity Streak
        </span>
        {/* Legend in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Less</span>
          {[false, 0, 1, 2, 3, 4].map((v, i) => (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                backgroundColor: v === false ? 'var(--surface)' : cellColor(v as number, true),
                border: '1px solid var(--border)',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>More</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '14px 16px 16px', overflowX: 'auto', overflowY: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {isLoading ? (
          <div style={{ height: 100, opacity: 0.3, backgroundColor: 'var(--surface)', borderRadius: 6, width: '100%' }} />
        ) : (
          <div style={{ margin: '0 auto' }}>
            {/* Month labels */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              columnGap: gap,
              marginBottom: 4,
            }}>
              <div />
              {monthSlots.map((label, i) => (
                <div key={i} style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'visible' }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Day rows */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gridAutoRows: `${cellSize}px`,
              gap,
            }}>
              {[0, 1, 2, 3, 4, 5, 6].map(dow => (
                <>
                  <div
                    key={`lbl-${dow}`}
                    style={{ fontSize: 9, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                  >
                    {DAY_LABELS[dow]}
                  </div>
                  {weeks.map((week, wi) => {
                    const cell = week[dow]
                    return (
                      <div
                        key={`${wi}-${dow}`}
                        title={cell.inRange
                          ? `${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${cell.count === 0 ? 'No activities' : `${cell.count} activit${cell.count === 1 ? 'y' : 'ies'}`}`
                          : undefined
                        }
                        style={{
                          borderRadius: weeks.length > 30 ? 2 : 3,
                          backgroundColor: cellColor(cell.count, cell.inRange),
                          border: cell.inRange ? '1px solid var(--border)' : 'none',
                        }}
                      />
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
