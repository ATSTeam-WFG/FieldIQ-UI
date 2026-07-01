'use client'

import { useState, useEffect } from 'react'
import {
  X, Download, ExternalLink, ChevronDown,
  Utensils, Hand, GraduationCap, Coffee, Gift, Phone, Handshake, Plus,
} from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import { DatePickerInput } from './DatePickerInput'
import { FieldLabel } from './FieldLabel'
import { useTheme } from '@/lib/context/ThemeContext'
import { downloadCsv, type ExportType, type ExportFilters, type ExportHistoryItem } from '@/lib/api/exports'
import { toast } from '@/lib/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

type Period = 'mtd' | 'qtd' | 'ytd' | 'custom'

export interface ExportCard {
  type: ExportType | 'pdf-performance' | 'pdf-team'
  title: string
  description: string
  format: 'CSV' | 'PDF'
  icon: React.ElementType
  managerOnly?: boolean
}

interface ExportPanelProps {
  card: ExportCard
  defaultPeriod: Period
  defaultDateFrom?: string
  defaultDateTo?: string
  onClose: () => void
  onDownloaded: (item: Omit<ExportHistoryItem, 'id' | 'generatedAt'>) => void
  teamAgents?: { id: string; name: string }[]
}

// ── Activity tile data ────────────────────────────────────────────────────────

const ACTIVITY_TILES = [
  { value: 'lunch',        label: 'Lunch',        icon: Utensils },
  { value: 'pop_by',       label: 'Pop-by',       icon: Hand },
  { value: 'ce_class',     label: 'CE Class',     icon: GraduationCap },
  { value: 'coffee',       label: 'Coffee',       icon: Coffee },
  { value: 'closing_gift', label: 'Closing Gift', icon: Gift },
  { value: 'call',         label: 'Call',         icon: Phone },
  { value: 'sponsorship',  label: 'Sponsorship',  icon: Handshake },
  { value: 'other',        label: 'Other',        icon: Plus },
]

const CONTACT_TYPES = [
  { value: 'referral_agent', label: 'Referral Agent' },
  { value: 'lender',         label: 'Lender' },
  { value: 'attorney',       label: 'Attorney' },
  { value: 'inspector',      label: 'Inspector' },
  { value: 'sponsor',        label: 'Sponsor' },
  { value: 'other',          label: 'Other' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActivityTypeTiles({
  selected, onChange, theme,
}: { selected: string[]; onChange: (v: string[]) => void; theme: string }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])
  const rows = [ACTIVITY_TILES.slice(0, 4), ACTIVITY_TILES.slice(4)]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 8 }}>
          {row.map(tile => {
            const active = selected.includes(tile.value)
            return (
              <button
                key={tile.value}
                type="button"
                onClick={() => toggle(tile.value)}
                className="flex flex-col items-center justify-center rounded-[8px] transition-all"
                style={{
                  height: 72, gap: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  backgroundColor: active ? (theme === 'dark' ? '#1f1a12' : '#fdf8f0') : 'var(--surface)',
                  border: active ? '2px solid #c4a574' : '1px solid var(--border)',
                  color: active ? '#c4a574' : 'var(--muted)',
                  boxShadow: active ? '0 0 0 3px rgba(196,165,116,0.12)' : 'none',
                }}
              >
                <tile.icon size={18} />
                {tile.label}
              </button>
            )
          })}
        </div>
      ))}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          Clear selection (export all types)
        </button>
      )}
    </div>
  )
}

function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', height: 40, padding: '0 12px', paddingRight: 36,
          borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface)', color: 'var(--foreground)',
          fontSize: 14, appearance: 'none', cursor: 'pointer',
        }}
      >
        <option value="">All statuses</option>
        <option value="logged">Logged</option>
        <option value="complete">Completed</option>
        <option value="follow_up">Follow-up</option>
      </select>
      <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
    </div>
  )
}

function ContactTypeChips({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {CONTACT_TYPES.map(o => {
        const active = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            style={{
              height: 36, padding: '0 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: active ? '1px solid #c4a574' : '1px solid var(--border)',
              background: active ? 'rgba(196,165,116,0.12)' : 'var(--surface)',
              color: active ? '#c4a574' : 'var(--body)',
              fontWeight: active ? 600 : 400,
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function DualRangeSlider({
  lo, hi, setLo, setHi,
}: { lo: number; hi: number; setLo: (v: number) => void; setHi: (v: number) => void }) {
  return (
    <>
      <style>{`
        .export-range { position: absolute; width: 100%; height: 4px; appearance: none; background: transparent; pointer-events: none; outline: none; }
        .export-range::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #c4a574; border: 2px solid var(--card); cursor: pointer; pointer-events: auto; }
        .export-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #c4a574; border: 2px solid var(--card); cursor: pointer; pointer-events: auto; }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Score range</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{lo} – {hi}</span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', width: '100%', height: 4, borderRadius: 2,
          background: `linear-gradient(to right, var(--border) ${lo}%, #c4a574 ${lo}%, #c4a574 ${hi}%, var(--border) ${hi}%)`,
        }} />
        <input
          type="range" min={0} max={100} value={lo}
          onChange={e => setLo(Math.min(Number(e.target.value), hi - 1))}
          className="export-range"
        />
        <input
          type="range" min={0} max={100} value={hi}
          onChange={e => setHi(Math.max(Number(e.target.value), lo + 1))}
          className="export-range"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>0</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>100</span>
      </div>
    </>
  )
}

function AgentChips({ agents, selected, onChange }: {
  agents: { id: string; name: string }[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {agents.map(a => {
        const active = selected.includes(a.id)
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.id)}
            style={{
              height: 36, padding: '0 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: active ? '1px solid #c4a574' : '1px solid var(--border)',
              background: active ? 'rgba(196,165,116,0.12)' : 'var(--surface)',
              color: active ? '#c4a574' : 'var(--body)',
              fontWeight: active ? 600 : 400,
            }}
          >
            {a.name}
          </button>
        )
      })}
    </div>
  )
}

function NumberInput({ label, value, onChange, min = 0, max = 365 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--body)', flex: 1 }}>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: 80, height: 40, padding: '0 12px', borderRadius: 8, fontSize: 14, textAlign: 'center',
          border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)',
        }}
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ExportPanel({
  card,
  defaultPeriod,
  defaultDateFrom = '',
  defaultDateTo = '',
  onClose,
  onDownloaded,
  teamAgents = [],
}: ExportPanelProps) {
  const { theme } = useTheme()
  const Icon = card.icon
  const isPdf = card.format === 'PDF'

  const [period, setPeriod]         = useState<Period>(defaultPeriod)
  const [dateFrom, setDateFrom]     = useState(defaultDateFrom)
  const [dateTo, setDateTo]         = useState(defaultDateTo)
  const [activityTypes, setActivityTypes] = useState<string[]>([])
  const [status, setStatus]         = useState('')
  const [contactTypes, setContactTypes]   = useState<string[]>([])
  const [scoreLo, setScoreLo]       = useState(0)
  const [scoreHi, setScoreHi]       = useState(100)
  const [agentIds, setAgentIds]     = useState<string[]>([])
  const [scoreThreshold, setScoreThreshold]       = useState(30)
  const [dormancyThreshold, setDormancyThreshold] = useState(45)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    setPeriod(defaultPeriod)
    setDateFrom(defaultDateFrom)
    setDateTo(defaultDateTo)
    setActivityTypes([])
    setStatus('')
    setContactTypes([])
    setScoreLo(0)
    setScoreHi(100)
    setAgentIds([])
    setScoreThreshold(30)
    setDormancyThreshold(45)
    setLoading(false)
  }, [card.type, defaultPeriod, defaultDateFrom, defaultDateTo])

  const effectivePeriod = period === 'custom' ? 'ytd' : period
  const customInvalid = period === 'custom' && (!dateFrom || !dateTo)

  function buildFilters(): ExportFilters {
    return {
      activityTypes: activityTypes.length ? activityTypes : undefined,
      status: status || undefined,
      contactTypes: contactTypes.length ? contactTypes : undefined,
      minScore: scoreLo > 0 ? scoreLo : undefined,
      maxScore: scoreHi < 100 ? scoreHi : undefined,
      agentIds: agentIds.length ? agentIds : undefined,
      scoreThreshold,
      dormancyThreshold,
    }
  }

  async function handleAction() {
    if (isPdf) {
      const route = card.type === 'pdf-team' ? '/reports/team' : '/reports/performance'
      window.open(`${route}?period=${effectivePeriod}`, '_blank')
      onDownloaded({ type: 'performance-snapshot', label: card.title, format: 'PDF', period: period.toUpperCase() })
      onClose()
      return
    }
    setLoading(true)
    try {
      await downloadCsv(
        card.type as ExportType,
        effectivePeriod,
        period === 'custom' ? dateFrom : undefined,
        period === 'custom' ? dateTo : undefined,
        buildFilters(),
      )
      onDownloaded({ type: card.type as ExportType, label: card.title, format: 'CSV', period: period.toUpperCase() })
      onClose()
    } catch {
      toast({ title: 'Download failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // ── Per-type filter sections ──────────────────────────────────────────────────

  function renderFilters() {
    switch (card.type) {
      case 'activities':
        return (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 10 }}><FieldLabel>ACTIVITY TYPE</FieldLabel></div>
              <ActivityTypeTiles selected={activityTypes} onChange={setActivityTypes} theme={theme} />
            </div>
            <div>
              <div style={{ marginBottom: 10 }}><FieldLabel>STATUS</FieldLabel></div>
              <StatusSelect value={status} onChange={setStatus} />
            </div>
          </>
        )

      case 'spend-summary':
        return (
          <div>
            <div style={{ marginBottom: 10 }}><FieldLabel>ACTIVITY TYPE</FieldLabel></div>
            <ActivityTypeTiles selected={activityTypes} onChange={setActivityTypes} theme={theme} />
          </div>
        )

      case 'contacts':
        return (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 10 }}><FieldLabel>CONTACT TYPES <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty = all)</span></FieldLabel></div>
              <ContactTypeChips selected={contactTypes} onChange={setContactTypes} />
            </div>
            <div>
              <DualRangeSlider lo={scoreLo} hi={scoreHi} setLo={setScoreLo} setHi={setScoreHi} />
            </div>
          </>
        )

      case 'team-activities':
        return (
          <>
            {teamAgents.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 10 }}><FieldLabel>AGENTS <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty = all)</span></FieldLabel></div>
                <AgentChips agents={teamAgents} selected={agentIds} onChange={setAgentIds} />
              </div>
            )}
            <div>
              <div style={{ marginBottom: 10 }}><FieldLabel>ACTIVITY TYPE</FieldLabel></div>
              <ActivityTypeTiles selected={activityTypes} onChange={setActivityTypes} theme={theme} />
            </div>
          </>
        )

      case 'team-performance':
        return teamAgents.length > 0 ? (
          <div>
            <div style={{ marginBottom: 10 }}><FieldLabel>AGENTS <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty = all)</span></FieldLabel></div>
            <AgentChips agents={teamAgents} selected={agentIds} onChange={setAgentIds} />
          </div>
        ) : null

      case 'at-risk-contacts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Contacts are flagged if their score falls below the threshold OR they haven&apos;t been contacted in more than the dormancy days.
            </p>
            <NumberInput label="Score below" value={scoreThreshold} onChange={setScoreThreshold} min={0} max={100} />
            <NumberInput label="Days dormant >" value={dormancyThreshold} onChange={setDormancyThreshold} min={1} max={365} />
          </div>
        )

      default:
        return null
    }
  }

  const filters = renderFilters()

  return (
    <SlideOverPanel onClose={onClose} width={520}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color="var(--muted)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>{card.title}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                backgroundColor: isPdf ? 'rgba(196,165,116,0.12)' : 'var(--surface)',
                color: isPdf ? '#c4a574' : 'var(--muted)',
                border: `1px solid ${isPdf ? 'rgba(196,165,116,0.3)' : 'var(--border)'}`,
              }}>
                {card.format}
              </span>
            </div>
            <p className="hidden md:block" style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', lineHeight: 1.4 }}>{card.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} color="var(--muted)" />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Time Range — full-width grid */}
        <div style={{ marginBottom: filters ? 24 : 0 }}>
          <div style={{ marginBottom: 10 }}><FieldLabel>TIME RANGE</FieldLabel></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {(['mtd', 'qtd', 'ytd', 'custom'] as Period[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                style={{
                  height: 40, borderRadius: 8, cursor: 'pointer',
                  background: period === p ? '#c4a574' : 'var(--surface)',
                  color: period === p ? '#000' : 'var(--muted)',
                  fontSize: 12, fontWeight: 600,
                  border: period === p ? '1px solid #c4a574' : '1px solid var(--border)',
                }}
              >
                {p === 'custom' ? 'Custom' : p.toUpperCase()}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 32, flexShrink: 0 }}>From</span>
                <div style={{ flex: 1 }}><DatePickerInput value={dateFrom} onChange={setDateFrom} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 32, flexShrink: 0 }}>To</span>
                <div style={{ flex: 1 }}><DatePickerInput value={dateTo} onChange={setDateTo} /></div>
              </div>
            </div>
          )}
        </div>

        {/* Type-specific filters */}
        {filters && (
          <>
            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '0 0 20px' }} />
            {filters}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0, padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={handleAction}
          disabled={loading || customInvalid}
          style={{
            flex: 1, height: 44, borderRadius: 8, border: 'none',
            cursor: customInvalid || loading ? 'not-allowed' : 'pointer',
            background: customInvalid ? 'var(--surface)' : '#c4a574',
            color: customInvalid ? 'var(--muted)' : '#000',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Generating…' : isPdf
            ? <><ExternalLink size={15} /> Open &amp; Print</>
            : <><Download size={15} /> Generate &amp; Download</>
          }
        </button>
      </div>
    </SlideOverPanel>
  )
}
