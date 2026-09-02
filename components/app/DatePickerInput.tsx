'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePickerInput({
  value,
  onChange,
  goldBorder = false,
}: {
  value: string
  onChange: (v: string) => void
  goldBorder?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setDisplayMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    }
  }, [value])

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const selected = value ? new Date(value + 'T00:00:00') : null
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay()

  function selectDay(day: number) {
    const y = displayMonth.getFullYear()
    const m = String(displayMonth.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  function formatDisplay(v: string) {
    if (!v) return 'Select date'
    return new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex w-full items-center justify-between rounded-[8px] transition-colors"
        style={{
          height: 40, padding: '0 12px',
          backgroundColor: 'var(--surface)',
          border: goldBorder ? '1px solid #c4a574' : '1px solid var(--border)',
          fontSize: 14,
          color: value ? 'var(--foreground)' : 'var(--muted)',
          textAlign: 'left',
        }}
      >
        <span>{formatDisplay(value)}</span>
        <Calendar size={16} style={{ color: goldBorder ? '#c4a574' : 'var(--muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="absolute left-0 z-30 rounded-[10px] overflow-hidden"
          style={{
            top: 46,
            width: 280,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          }}
        >
          {/* Month navigation */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setDisplayMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
            >
              <ChevronLeft size={15} style={{ color: 'var(--muted)' }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
              {MONTH_NAMES[displayMonth.getMonth()]} {displayMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setDisplayMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
            >
              <ChevronRight size={15} style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7" style={{ padding: '10px 10px 4px' }}>
            {DAY_LABELS.map(d => (
              <div key={d} className="flex items-center justify-center" style={{ height: 26 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7" style={{ padding: '0 10px 10px' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`o${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const cellDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
              const isSelected = !!selected && cellDate.getTime() === selected.getTime()
              const isToday = cellDate.getTime() === todayDate.getTime()
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="flex items-center justify-center rounded-full transition-colors hover:bg-[var(--surface)]"
                  style={{
                    height: 34, width: 34, margin: '1px auto',
                    fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    backgroundColor: isSelected ? '#c4a574' : 'transparent',
                    color: isSelected ? '#000000' : isToday ? '#c4a574' : 'var(--body)',
                    border: isToday && !isSelected ? '1.5px solid #c4a574' : 'none',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
