'use client'

import { useState } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { useContract } from '@/lib/context/ContractContext'
import { useRole } from '@/lib/context/RoleContext'
import contractsData from '@/lib/mock-data/contracts.json'

// ── Types ─────────────────────────────────────────────────────────────────────

type ContractStatus = 'initiated' | 'pending' | 'closed' | 'updated'

interface Contract {
  id: string
  agentName: string
  contactId: string
  contactName: string
  contactCompany: string
  title: string
  status: ContractStatus
  amount: number
  expectedClosingDate?: string
  actualClosingDate?: string
  createdDate: string
  notes?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function closingDate(contract: Contract): string {
  const raw = contract.actualClosingDate ?? contract.expectedClosingDate
  if (!raw) return '—'
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Contract Status Badge ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; border: string }> = {
  initiated: { label: 'Initiated', color: 'var(--muted)',  border: 'var(--border)' },
  pending:   { label: 'Pending',   color: '#d97706',       border: '#d97706'       },
  closed:    { label: 'Closed',    color: '#16a34a',       border: '#16a34a'       },
  updated:   { label: 'Updated',   color: '#60a5fa',       border: '#60a5fa'       },
}

function ContractBadge({ status }: { status: ContractStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px]"
      style={{
        height: 22,
        padding: '0 8px',
        fontSize: 11,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        backgroundColor: 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS: { key: ContractStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'initiated', label: 'Initiated' },
  { key: 'pending',   label: 'Pending'   },
  { key: 'closed',    label: 'Closed'    },
  { key: 'updated',   label: 'Updated'   },
]

// ── Page ──────────────────────────────────────────────────────────────────────

function agentInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('')
}

export default function ContractsPage() {
  const { openLog, openContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'

  const [activeFilter, setActiveFilter] = useState<ContractStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  // Agent view: only own contracts; manager view: all contracts
  const baseContracts = isManager
    ? (contractsData as Contract[])
    : (contractsData as Contract[]).filter(c => c.agentName === 'Sarah Chen')

  const filtered = baseContracts.filter(c => {
    const matchesStatus = activeFilter === 'all' || c.status === activeFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      c.contactName.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (isManager && c.agentName.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  return (
    <AppShell activeItem="Contracts">
      <div className="flex flex-col" style={{ gap: 0 }}>

        {/* ── Page header ───────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col" style={{ gap: 4 }}>
            <h1
              className="font-semibold leading-tight"
              style={{ fontSize: 22, color: 'var(--foreground)' }}
            >
              Contracts
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Track and manage your title closing deals.
            </p>
          </div>

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
              border: 'none',
            }}
          >
            <Plus size={14} color="#000000" />
            Add Contract
          </button>
        </div>

        {/* ── Filter + Search ───────────────────────────── */}
        <div className="flex flex-col" style={{ marginTop: 24, gap: 12 }}>
          {/* Filter tabs */}
          <div
            className="flex overflow-hidden rounded-[8px]"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              height: 36,
              alignSelf: 'flex-start',
            }}
          >
            {FILTER_TABS.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="flex items-center justify-center font-medium transition-colors"
                style={{
                  height: 36,
                  paddingLeft: 14,
                  paddingRight: 14,
                  fontSize: 13,
                  backgroundColor: activeFilter === tab.key ? '#c4a574' : 'transparent',
                  color: activeFilter === tab.key ? '#000000' : 'var(--muted)',
                  borderRight: i < FILTER_TABS.length - 1 ? '1px solid var(--border)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search — full width */}
          <div
            className="flex items-center rounded-[8px] w-full"
            style={{
              height: 36,
              paddingLeft: 12,
              paddingRight: 12,
              gap: 8,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <Search size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by contact or title…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: 13,
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        {/* ── Contracts table ───────────────────────────── */}
        <div className="fieldiq-card" style={{ marginTop: 16 }}>

          {/* Desktop table header */}
          <div
            className="hidden md:flex items-center"
            style={{
              height: 32,
              padding: '0 20px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
            }}
          >
            {([
                { label: 'TITLE',        flex: 2   },
                ...(isManager ? [{ label: 'AGENT', flex: 1.4 }] : []),
                { label: 'CONTACT',      flex: 1.5 },
                { label: 'AMOUNT',       flex: 1   },
                { label: 'STATUS',       flex: 1   },
                { label: 'CLOSING DATE', flex: 1.2 },
              ] as { label: string; flex: number }[]
            ).map(col => (
              <span
                key={col.label}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                  flex: col.flex,
                  minWidth: 0,
                }}
              >
                {col.label}
              </span>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div
              className="flex flex-col items-center justify-center"
              style={{ padding: '48px 20px', gap: 8 }}
            >
              <FileText size={28} style={{ color: 'var(--border)' }} />
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No contracts found.</p>
            </div>
          )}

          {/* Desktop rows */}
          {filtered.map((contract, idx) => {
            const isLast = idx === filtered.length - 1
            return (
              <div key={contract.id}>
                {/* Desktop row */}
                <div
                  onClick={() => openContract(contract)}
                  className="hidden md:flex items-center hover:bg-[var(--surface)]"
                  style={{
                    height: 56,
                    padding: '0 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {/* TITLE */}
                  <div style={{ flex: 2, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
                      {contract.title}
                    </span>
                  </div>

                  {/* AGENT — manager only */}
                  {isManager && (
                    <div style={{ flex: 1.4, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: '#c4a574', fontSize: 9, fontWeight: 600, color: '#000000' }}
                      >
                        {agentInitials(contract.agentName)}
                      </div>
                      <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                        {contract.agentName}
                      </span>
                    </div>
                  )}

                  {/* CONTACT */}
                  <div style={{ flex: 1.5, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 13, color: 'var(--body)' }}>
                      {contract.contactName}
                    </span>
                    <span className="truncate block" style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {contract.contactCompany}
                    </span>
                  </div>

                  {/* AMOUNT */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                      {formatCurrency(contract.amount)}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ContractBadge status={contract.status} />
                  </div>

                  {/* CLOSING DATE */}
                  <div style={{ flex: 1.2, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {closingDate(contract)}
                    </span>
                  </div>

                </div>

                {/* Mobile card row */}
                <div
                  onClick={() => openContract(contract)}
                  className="flex items-center md:hidden"
                  style={{
                    padding: '14px 16px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex flex-1 min-w-0 flex-col" style={{ gap: 4 }}>
                    <span
                      className="truncate font-medium"
                      style={{ fontSize: 13, color: 'var(--foreground)' }}
                    >
                      {contract.title}
                    </span>
                    <span
                      className="truncate"
                      style={{ fontSize: 11, color: 'var(--muted)' }}
                    >
                      {isManager ? `${contract.agentName} · ` : ''}{contract.contactName} · {closingDate(contract)}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end" style={{ gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                      {formatCurrency(contract.amount)}
                    </span>
                    <ContractBadge status={contract.status} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </AppShell>
  )
}
