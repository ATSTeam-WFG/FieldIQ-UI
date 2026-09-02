'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTES = [0, 15, 30, 45]

export function TimePickerInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Parse "HH:MM" (24h)
  const parts = value.split(':')
  const h24 = parseInt(parts[0] ?? '12')
  const min = parseInt(parts[1] ?? '0')
  const isPM = h24 >= 12
  const h12 = h24 % 12 || 12

  function buildTime(newH12: number, newMin: number, newIsPM: boolean): string {
    const h = newIsPM ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12)
    return `${String(h).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`
  }

  function formatDisplay(v: string) {
    if (!v) return 'Select time'
    const [hh, mm] = v.split(':')
    const h = parseInt(hh ?? '12')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const display = h % 12 || 12
    return `${display}:${mm} ${ampm}`
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
          border: '1px solid var(--border)',
          fontSize: 14,
          color: value ? 'var(--foreground)' : 'var(--muted)',
          textAlign: 'left',
        }}
      >
        <span>{formatDisplay(value)}</span>
        <Clock size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="absolute left-0 z-30 rounded-[10px] overflow-hidden"
          style={{
            top: 46, width: 248,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)' }}>
              SELECT TIME
            </span>
          </div>

          <div className="flex" style={{ padding: '10px 12px 0' }}>
            {/* Hours — 3×4 grid */}
            <div className="flex flex-1 flex-col" style={{ gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', paddingLeft: 2 }}>
                HOUR
              </span>
              <div className="grid grid-cols-3" style={{ gap: 2 }}>
                {HOURS_12.map(h => {
                  const isSelected = h12 === h
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onChange(buildTime(h, min, isPM))}
                      className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
                      style={{
                        height: 32, fontSize: 13, fontWeight: isSelected ? 600 : 400,
                        backgroundColor: isSelected ? '#c4a574' : 'transparent',
                        color: isSelected ? '#000000' : 'var(--body)',
                      }}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, backgroundColor: 'var(--border)', margin: '0 10px' }} />

            {/* Minutes */}
            <div className="flex flex-col" style={{ gap: 6, width: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', paddingLeft: 2 }}>
                MIN
              </span>
              <div className="flex flex-col" style={{ gap: 2 }}>
                {MINUTES.map(m => {
                  const isSelected = min === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChange(buildTime(h12, m, isPM))}
                      className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
                      style={{
                        height: 32, fontSize: 13, fontWeight: isSelected ? 600 : 400,
                        backgroundColor: isSelected ? '#c4a574' : 'transparent',
                        color: isSelected ? '#000000' : 'var(--body)',
                      }}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* AM / PM toggle */}
          <div
            className="flex"
            style={{ padding: '10px 12px 12px', gap: 6, borderTop: '1px solid var(--border)', marginTop: 10 }}
          >
            {(['AM', 'PM'] as const).map(period => {
              const isActive = period === (isPM ? 'PM' : 'AM')
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    const wantPM = period === 'PM'
                    if (wantPM !== isPM) onChange(buildTime(h12, min, wantPM))
                  }}
                  className="flex flex-1 items-center justify-center rounded-[6px] transition-colors"
                  style={{
                    height: 32, fontSize: 13, fontWeight: 500,
                    backgroundColor: isActive ? '#c4a574' : 'var(--surface)',
                    color: isActive ? '#000000' : 'var(--muted)',
                    border: isActive ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {period}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
