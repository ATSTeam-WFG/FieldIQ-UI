'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  FileText, Users, TrendingUp, BarChart2,
  AlertTriangle, Calendar, Trash2, ChevronRight,
} from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { useRole } from '@/lib/context/RoleContext'
import { useExportHistory } from '@/lib/hooks/useExports'
import { useManagerPerformance } from '@/lib/hooks/useManagerPerformance'
import { ExportPanel, type ExportCard } from '@/components/fieldiq/ExportPanel'

const EXPORT_CARDS: ExportCard[] = [
  {
    type: 'activities',
    icon: Calendar,
    title: 'Activity Log',
    description: 'Every logged activity with contact, spend, notes, and status',
    format: 'CSV',
  },
  {
    type: 'spend-summary',
    icon: BarChart2,
    title: 'Spend Summary',
    description: 'Total spend grouped by activity type with averages',
    format: 'CSV',
  },
  {
    type: 'contacts',
    icon: Users,
    title: 'Relationship Health',
    description: 'All contacts with scores, 30-day trend, and days dormant',
    format: 'CSV',
  },
  {
    type: 'pdf-performance',
    icon: FileText,
    title: 'Performance Report',
    description: 'Full performance page formatted for printing or PDF export',
    format: 'PDF',
  },
  {
    type: 'team-activities',
    icon: Calendar,
    title: 'Team Activity Log',
    description: 'All activities across every rep on your team',
    format: 'CSV',
    managerOnly: true,
  },
  {
    type: 'team-performance',
    icon: TrendingUp,
    title: 'Team Performance',
    description: 'Per-agent breakdown: activities, spend, score, closings',
    format: 'CSV',
    managerOnly: true,
  },
  {
    type: 'at-risk-contacts',
    icon: AlertTriangle,
    title: 'At-Risk Contacts',
    description: 'Contacts with low scores or dormant 45+ days across your team',
    format: 'CSV',
    managerOnly: true,
  },
  {
    type: 'pdf-team',
    icon: FileText,
    title: 'Team Report',
    description: 'Full manager performance page formatted for printing or PDF export',
    format: 'PDF',
    managerOnly: true,
  },
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ExportsPage() {
  const { role, persona } = useRole()
  const { history, add, clear } = useExportHistory()
  const isManager = role === 'manager'

  const [openCard, setOpenCard] = useState<ExportCard | null>(null)

  // Fetch team agents for manager filters (name used as ID proxy since AgentPerfEntry has no id field)
  const { data: teamData } = useManagerPerformance('ytd')
  const teamAgents = isManager
    ? (teamData?.agents ?? []).map(a => ({ id: a.name, name: a.name }))
    : []

  const cards = EXPORT_CARDS.filter(c => !c.managerOnly || isManager)

  return (
    <AppShell activeItem="Exports">
      <div>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-semibold" style={{ fontSize: 22, color: 'var(--foreground)' }}>
            Exports
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            {persona.name} · {isManager ? 'Manager' : 'Field Agent'}
          </p>
        </div>

        {/* Export cards grid — full clickable */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {cards.map(card => {
            const Icon = card.icon
            const isPdf = card.format === 'PDF'
            return (
              <div
                key={card.type}
                className="fieldiq-card"
                onClick={() => setOpenCard(card)}
                style={{
                  display: 'flex', flexDirection: 'column', padding: '16px 20px', gap: 12,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderTopColor = '#d4b584')}
                onMouseLeave={e => (e.currentTarget.style.borderTopColor = '#c4a574')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color="var(--muted)" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{card.title}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                      backgroundColor: isPdf ? 'rgba(196,165,116,0.12)' : 'var(--surface)',
                      color: isPdf ? '#c4a574' : 'var(--muted)',
                      border: `1px solid ${isPdf ? 'rgba(196,165,116,0.3)' : 'var(--border)'}`,
                    }}>
                      {card.format}
                    </span>
                    <ChevronRight size={14} color="var(--muted)" />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, flex: 1, margin: 0 }}>
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Export history */}
        <div className="fieldiq-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>Export History</span>
            {history.length > 0 && (
              <button onClick={clear} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 26,
                borderRadius: 5, border: '1px solid var(--border)', background: 'transparent',
                fontSize: 11, color: 'var(--muted)', cursor: 'pointer',
              }}>
                <Trash2 size={11} /> Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No exports yet. Click any export card to get started.
            </div>
          ) : (
            <div>
              {/* Desktop header only */}
              <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 60px 80px 120px', padding: '8px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                {['Type', 'Format', 'Period', 'Generated'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {history.map((item, i) => (
                <div key={item.id} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {/* Desktop row */}
                  <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 60px 80px 120px', padding: '12px 20px', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, width: 'fit-content', backgroundColor: item.format === 'PDF' ? 'rgba(196,165,116,0.12)' : 'var(--surface)', color: item.format === 'PDF' ? '#c4a574' : 'var(--muted)', border: `1px solid ${item.format === 'PDF' ? 'rgba(196,165,116,0.3)' : 'var(--border)'}` }}>
                      {item.format}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.period}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{relativeTime(item.generatedAt)}</span>
                  </div>
                  {/* Mobile row — two-line list style */}
                  <div className="flex md:hidden items-center justify-between" style={{ padding: '14px 20px', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.period} · {relativeTime(item.generatedAt)}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, flexShrink: 0,
                      backgroundColor: item.format === 'PDF' ? 'rgba(196,165,116,0.12)' : 'var(--surface)',
                      color: item.format === 'PDF' ? '#c4a574' : 'var(--muted)',
                      border: `1px solid ${item.format === 'PDF' ? 'rgba(196,165,116,0.3)' : 'var(--border)'}`,
                    }}>
                      {item.format}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export panel slide-over */}
      <AnimatePresence>
        {openCard && (
          <ExportPanel
            card={openCard}
            defaultPeriod="ytd"
            onClose={() => setOpenCard(null)}
            onDownloaded={(item) => { add(item); setOpenCard(null) }}
            teamAgents={isManager ? teamAgents : []}
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}

export default ExportsPage
