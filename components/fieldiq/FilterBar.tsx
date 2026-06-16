'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'

const RANGE_SLIDER_STYLES = `
  .fiq-range { -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; position: absolute; left: 0; right: 0; width: 100%; height: 20px; outline: none; margin: 0; }
  .fiq-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: all; width: 16px; height: 16px; border-radius: 50%; background: #c4a574; cursor: pointer; border: 2px solid var(--card); box-shadow: 0 0 0 1.5px #c4a574; }
  .fiq-range::-moz-range-thumb { pointer-events: all; width: 12px; height: 12px; border-radius: 50%; background: #c4a574; cursor: pointer; border: 2px solid var(--card); box-shadow: 0 0 0 1.5px #c4a574; }
  .fiq-range::-webkit-slider-runnable-track { background: transparent; }
`

// ── Shared option type ────────────────────────────────────────────────────────

export interface FilterOption<T extends string = string> {
  value: T
  label: string
}

// ── FilterSearchBar ───────────────────────────────────────────────────────────

export function FilterSearchBar({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div
      className="flex items-center w-full rounded-[8px]"
      style={{
        height: 44,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        paddingLeft: 14,
        paddingRight: 14,
        gap: 10,
      }}
    >
      <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: 14,
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}

// ── FilterPills ───────────────────────────────────────────────────────────────
// For ≤4 options.
// Mobile: full-width equal-stretch buttons.
// Desktop: auto-width, shrinks to content (md:self-start + md:flex-none).

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  variant = 'filled',
}: {
  options: FilterOption<T>[]
  value: T
  onChange: (v: T) => void
  variant?: 'filled' | 'ghost'
}) {
  if (variant === 'ghost') {
    return (
      <div className="flex gap-2">
        {options.map(opt => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex items-center justify-center rounded-[8px] transition-colors"
              style={{
                height: 36,
                paddingLeft: 14,
                paddingRight: 14,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? '#c4a574' : 'var(--muted)',
                border: active ? '1px solid #c4a574' : '1px solid var(--border)',
                backgroundColor: active ? 'rgba(196,165,116,0.06)' : 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex w-full md:w-auto md:self-start overflow-hidden rounded-[8px]"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        height: 44,
      }}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex flex-1 md:flex-none items-center justify-center font-medium transition-colors px-3 md:px-4"
          style={{
            fontSize: 13,
            backgroundColor: value === opt.value ? '#c4a574' : 'transparent',
            color: value === opt.value ? '#000000' : 'var(--muted)',
            borderRight: i < options.length - 1 ? '1px solid var(--border)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── RangeSlider ───────────────────────────────────────────────────────────────

export function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [lo, hi] = value
  const range = max - min
  const loPercent = ((lo - min) / range) * 100
  const hiPercent = ((hi - min) / range) * 100
  const label = `$${lo} – ${hi >= max ? `$${max}+` : `$${hi}`}`

  return (
    <div style={{ width: '100%' }}>
      <style>{RANGE_SLIDER_STYLES}</style>

      <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{label}</span>
        {(lo !== min || hi !== max) && (
          <button
            type="button"
            onClick={() => onChange([min, max])}
            style={{ fontSize: 11, color: '#c4a574', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        {/* Background track */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
        {/* Gold fill */}
        <div style={{
          position: 'absolute',
          left: `${loPercent}%`,
          width: `${hiPercent - loPercent}%`,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#c4a574',
        }} />

        {/* Min handle */}
        <input
          type="range"
          className="fiq-range"
          min={min}
          max={max}
          step={5}
          value={lo}
          onChange={e => {
            const v = Math.min(Number(e.target.value), hi - 5)
            onChange([v, hi])
          }}
          style={{ zIndex: lo >= hi - 5 ? 5 : 3 }}
        />

        {/* Max handle */}
        <input
          type="range"
          className="fiq-range"
          min={min}
          max={max}
          step={5}
          value={hi}
          onChange={e => {
            const v = Math.max(Number(e.target.value), lo + 5)
            onChange([lo, v])
          }}
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between" style={{ marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>${min}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>${max}+</span>
      </div>
    </div>
  )
}

// ── FilterDropdown ────────────────────────────────────────────────────────────
// For >4 options.
// Full-width trigger with a label prefix (e.g. "TYPE"), gold border + text
// when a non-default value is selected. Custom panel — no native <select>.

export function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: FilterOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const selected = options.find(o => o.value === value)
  const isFiltered = value !== options[0]?.value

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center rounded-[8px] transition-colors"
        style={{
          height: 44,
          paddingLeft: 14,
          paddingRight: 12,
          gap: 10,
          backgroundColor: 'var(--surface)',
          border: isFiltered ? '1px solid #c4a574' : '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', flexShrink: 0 }}>
          {label}
        </span>
        <div style={{ width: 1, height: 14, backgroundColor: 'var(--border)', flexShrink: 0 }} />
        <span
          className="flex-1 text-left truncate"
          style={{
            fontSize: 14,
            fontWeight: isFiltered ? 600 : 400,
            color: isFiltered ? '#c4a574' : 'var(--foreground)',
          }}
        >
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--muted)',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-30 overflow-hidden rounded-[8px]"
          style={{
            top: 50,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {options.map(opt => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                style={{
                  height: 44,
                  paddingLeft: 16,
                  paddingRight: 16,
                  gap: 10,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {active && (
                  <div style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#c4a574', flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#c4a574' : 'var(--body)',
                    marginLeft: active ? 0 : 13,
                  }}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
