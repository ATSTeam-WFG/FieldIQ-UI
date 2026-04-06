'use client'

import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { FilterSearchBar, FilterPills } from '@/components/fieldiq/FilterBar'
import type { FilterOption } from '@/components/fieldiq/FilterBar'
import { useContract } from '@/lib/context/ContractContext'
import { useRole } from '@/lib/context/RoleContext'
import contractsData from '@/lib/mock-data/contracts.json'

// ── Types ─────────────────────────────────────────────────────────────────────

type ContractStatus = 'opened' | 'closed' | 'cancelled'
type ContractType = 'Regular' | 'Refinance' | 'Commercial'

interface Contract {
  id: string
  agentName: string
  contactId: string
  contactName: string
  contactCompany: string
  fileNumber: string
  address: string
  type: ContractType
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
  opened:    { label: 'Opened',    color: 'var(--muted)', border: 'var(--border)' },
  closed:    { label: 'Closed',    color: '#16a34a',      border: '#16a34a'       },
  cancelled: { label: 'Cancelled', color: '#d97706',      border: '#d97706'       },
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

// ── Type Badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ContractType }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px]"
      style={{
        height: 22,
        padding: '0 8px',
        fontSize: 11,
        color: 'var(--body)',
        border: '1px solid var(--border)',
        backgroundColor: 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {type}
    </span>
  )
}

// ── Filter options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: FilterOption<ContractStatus | 'all'>[] = [
  { value: 'all',       label: 'All'       },
  { value: 'opened',    label: 'Opened'    },
  { value: 'closed',    label: 'Closed'    },
  { value: 'cancelled', label: 'Cancelled' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

function repInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('')
}

export default function ContractsPage() {
  const { openLog, openContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'

  const [activeFilter, setActiveFilter] = useState<ContractStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const baseContracts = isManager
    ? (contractsData as Contract[])
    : (contractsData as Contract[]).filter(c => c.agentName === 'Sarah Chen')

  const filtered = baseContracts.filter(c => {
    const matchesStatus = activeFilter === 'all' || c.status === activeFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      c.contactName.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.fileNumber.toLowerCase().includes(q) ||
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
        <div className="flex flex-col" style={{ marginTop: 24, gap: 10 }}>
          <FilterSearchBar value={search} onChange={setSearch} placeholder="Search by contact or address…" />
          <FilterPills options={STATUS_OPTIONS} value={activeFilter} onChange={setActiveFilter} />
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
                { label: 'FILE NUMBER',  flex: 1.4 },
                { label: 'ADDRESS',      flex: 2.2 },
                { label: 'CONTACT',      flex: 1.5 },
                { label: 'AMOUNT',       flex: 1   },
                { label: 'TYPE',         flex: 1   },
                { label: 'STATUS',       flex: 1   },
                { label: 'CLOSING DATE', flex: 1.2 },
                ...(isManager ? [{ label: 'REP', flex: 1.2 }] : []),
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
                  {/* FILE NUMBER */}
                  <div style={{ flex: 1.4, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--body)' }}>
                      {contract.fileNumber}
                    </span>
                  </div>

                  {/* ADDRESS */}
                  <div style={{ flex: 2.2, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
                      {contract.address}
                    </span>
                  </div>

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

                  {/* TYPE */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TypeBadge type={contract.type} />
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

                  {/* REP — manager only */}
                  {isManager && (
                    <div style={{ flex: 1.2, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: '#c4a574', fontSize: 9, fontWeight: 600, color: '#000000' }}
                      >
                        {repInitials(contract.agentName)}
                      </div>
                      <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                        {contract.agentName}
                      </span>
                    </div>
                  )}

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
                      {contract.address}
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
