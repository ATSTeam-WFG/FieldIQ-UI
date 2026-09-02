'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/app/AppShell'
import { FilterSearchBar, FilterDropdown } from '@/components/app/FilterBar'
import type { FilterOption } from '@/components/app/FilterBar'
import { SkeletonRows } from '@/components/app/SkeletonRows'
import { ContractDetailPanel } from '@/components/app/ContractDetailPanel'
import { useContract } from '@/lib/context/ContractContext'
import { useRole } from '@/lib/context/RoleContext'
import { useContracts } from '@/lib/hooks/useContracts'
import type { Contract } from '@/lib/api/contracts'

// ── Types ─────────────────────────────────────────────────────────────────────

const TYPE_FILTERS    = ['All', 'Regular', 'Refinance', 'Commercial'] as const
const STATUS_FILTERS  = ['All', 'Opened', 'Closed', 'Cancelled'] as const

type TypeFilter   = typeof TYPE_FILTERS[number]
type StatusFilter = typeof STATUS_FILTERS[number]

const TYPE_OPTIONS:   FilterOption<TypeFilter>[]   = TYPE_FILTERS.map(t => ({ value: t, label: t }))
const STATUS_OPTIONS: FilterOption<StatusFilter>[] = STATUS_FILTERS.map(s => ({ value: s, label: s }))

// Map display labels to API values
const TYPE_API_MAP: Record<string, string> = {
  Regular:    'purchase',
  Refinance:  'refinance',
  Commercial: 'commercial',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function closingDate(contract: Contract): string {
  const raw = contract.actual_closing_date ?? contract.expected_closing_date
  if (!raw) return '—'
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function closingDateRelative(contract: Contract): string {
  const raw = contract.actual_closing_date ?? contract.expected_closing_date
  if (!raw) return '—'
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Contract Status Badge ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  opened:    { label: 'Opened',    color: 'var(--muted)', border: 'var(--border)' },
  initiated: { label: 'Opened',    color: 'var(--muted)', border: 'var(--border)' },
  closed:    { label: 'Closed',    color: '#16a34a',      border: '#16a34a'       },
  cancelled: { label: 'Cancelled', color: '#d97706',      border: '#d97706'       },
}

function ContractBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'var(--muted)', border: 'var(--border)' }
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

const TYPE_DISPLAY: Record<string, string> = {
  purchase:   'Regular',
  refinance:  'Refinance',
  commercial: 'Commercial',
}

function TypeBadge({ type }: { type: string }) {
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
      {TYPE_DISPLAY[type] ?? type}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ContractsPageContent() {
  const { openLog, openContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'
  const searchParams = useSearchParams()

  const [selectedType,   setSelectedType]   = useState<TypeFilter>('All')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [detailContract, setDetailContract] = useState<Contract | null>(null)

  const { data, isLoading } = useContracts()
  const allContracts = data?.items ?? []

  // Open detail panel when ?view={id} is present (e.g. from a notification)
  useEffect(() => {
    const viewId = searchParams.get('view')
    if (!viewId || !allContracts.length) return
    const found = allContracts.find(c => c.id === viewId)
    if (found) setDetailContract(found)
  }, [searchParams, allContracts])

  // Derived stats
  const totalValue = allContracts.reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const now = new Date()
  const closingThisMonth = allContracts.filter(c => {
    const raw = c.expected_closing_date ?? c.actual_closing_date
    if (!raw) return false
    const d = new Date(raw)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const filtered = allContracts.filter(c => {
    const matchesType =
      selectedType === 'All' ||
      c.transaction_type === TYPE_API_MAP[selectedType]
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Opened'    && (c.status === 'opened' || c.status === 'initiated')) ||
      (selectedStatus === 'Closed'    && c.status === 'closed')    ||
      (selectedStatus === 'Cancelled' && c.status === 'cancelled')
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (c.contact?.name ?? '').toLowerCase().includes(q) ||
      (c.property_address ?? '').toLowerCase().includes(q) ||
      (c.file_number ?? '').toLowerCase().includes(q)
    return matchesType && matchesStatus && matchesSearch
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
              All logged contracts · MTD
            </p>
          </div>

          <button
            onClick={openLog}
            className="flex shrink-0 items-center gap-1.5 rounded-[8px] font-semibold transition-opacity hover:opacity-90 active:opacity-80 h-9 px-3.5 text-[13px] md:h-11 md:px-5 md:text-[14px]"
            style={{
              backgroundColor: '#c4a574',
              color: '#000000',
              border: 'none',
            }}
          >
            <Plus size={14} color="#000000" />
            Add Contract
          </button>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 10, marginTop: 16 }}>
          <FilterSearchBar value={search} onChange={setSearch} placeholder="Search by contact, address or file number…" />
          <div className="flex gap-2">
            <FilterDropdown className="flex-1" label="TYPE"   options={TYPE_OPTIONS}   value={selectedType}   onChange={setSelectedType} />
            <FilterDropdown className="flex-1" label="STATUS" options={STATUS_OPTIONS} value={selectedStatus} onChange={setSelectedStatus} />
          </div>
        </div>

        {/* ── Summary stats row ────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-x-6"
          style={{ marginTop: 16 }}
        >
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-semibold text-sm md:text-[15px]"
              style={{ color: '#c4a574' }}
            >
              {data?.total ?? allContracts.length}
            </span>
            <span className="text-xs md:text-[13px]" style={{ color: 'var(--muted)' }}>contracts</span>
          </div>

          <div className="hidden md:block" style={{ width: 1, height: 14, backgroundColor: 'var(--border)' }} />

          <div className="flex items-baseline gap-1.5">
            <span
              className="font-semibold text-sm md:text-[15px]"
              style={{ color: '#c4a574' }}
            >
              {formatCurrency(totalValue)}
            </span>
            <span className="text-xs md:text-[13px]" style={{ color: 'var(--muted)' }}>total value</span>
          </div>

          <div className="hidden md:block" style={{ width: 1, height: 14, backgroundColor: 'var(--border)' }} />

          <div className="flex items-baseline gap-1.5">
            <span
              className="font-semibold text-sm md:text-[15px]"
              style={{ color: '#c4a574' }}
            >
              {closingThisMonth}
            </span>
            <span className="text-xs md:text-[13px]" style={{ color: 'var(--muted)' }}>closing this month</span>
          </div>
        </div>

        {/* ── Contracts table card ─────────────────────── */}
        <div className="app-card" style={{ marginTop: 16 }}>

          {/* Card header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                className="font-semibold"
                style={{ fontSize: 14, color: 'var(--foreground)' }}
              >
                Contract Log
              </span>
              <span
                className="flex items-center justify-center rounded-full font-medium"
                style={{
                  height: 20,
                  minWidth: 20,
                  paddingLeft: 6,
                  paddingRight: 6,
                  fontSize: 11,
                  backgroundColor: 'var(--surface)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {filtered.length}
              </span>
            </div>
          </div>

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
            ] as { label: string; flex: number }[]).map(col => (
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

          {/* Loading */}
          {isLoading ? (
            <SkeletonRows cols={5} rows={8} />
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: 120, gap: 8 }}
            >
              <FileText size={24} style={{ color: 'var(--border)' }} />
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>No contracts match your filters</span>
            </div>
          ) : (
            filtered.map((contract, idx) => {
              const isLast = idx === filtered.length - 1
              return (
                <motion.div
                  key={contract.id}
                  onClick={() => openContract(contract as any)}
                  className="flex items-center transition-colors hover:bg-[var(--surface)] px-3 md:px-5"
                  style={{
                    height: 56,
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx, 9) * 0.04, duration: 0.15 }}
                >
                  {/* FILE NUMBER — desktop */}
                  <div className="hidden md:block" style={{ flex: 1.4, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--body)' }}>
                      {contract.file_number ?? '—'}
                    </span>
                  </div>

                  {/* ADDRESS — desktop */}
                  <div className="hidden md:block" style={{ flex: 2.2, minWidth: 0 }}>
                    <span className="truncate block" style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
                      {contract.property_address ?? '—'}
                    </span>
                    {contract.city && (
                      <span className="truncate block" style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {contract.city}
                      </span>
                    )}
                  </div>

                  {/* CONTACT — desktop */}
                  <div className="hidden md:flex flex-col justify-center" style={{ flex: 1.5, minWidth: 0, gap: 2 }}>
                    <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                      {contract.contact?.name ?? '—'}
                      {contract.secondary_contact && (
                        <span style={{ color: 'var(--muted)' }}> +1</span>
                      )}
                    </span>
                    <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {contract.secondary_contact?.name ?? contract.contact?.company ?? ''}
                    </span>
                  </div>

                  {/* AMOUNT — desktop */}
                  <div className="hidden md:block" style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                      {formatCurrency(contract.amount ?? 0)}
                    </span>
                  </div>

                  {/* TYPE — desktop */}
                  <div className="hidden md:flex items-center" style={{ flex: 1, minWidth: 0 }}>
                    <TypeBadge type={contract.transaction_type} />
                  </div>

                  {/* STATUS — desktop */}
                  <div className="hidden md:flex items-center" style={{ flex: 1, minWidth: 0 }}>
                    <ContractBadge status={contract.status} />
                  </div>

                  {/* CLOSING DATE — desktop */}
                  <div className="hidden md:block" style={{ flex: 1.2, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {closingDate(contract)}
                    </span>
                  </div>

                  {/* REP — manager + desktop */}
                  {isManager && (
                    <div className="hidden md:block" style={{ flex: 1.2, minWidth: 0 }}>
                      <span className="truncate" style={{ fontSize: 13, color: 'var(--muted)' }}>—</span>
                    </div>
                  )}

                  {/* Mobile: address + contact·date left, amount + status right */}
                  <div className="flex flex-1 items-center justify-between gap-3 md:hidden">
                    <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
                      <span className="truncate font-medium" style={{ fontSize: 13, color: 'var(--foreground)' }}>
                        {contract.property_address ?? '—'}
                      </span>
                      <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {contract.contact?.name ?? '—'} · {closingDateRelative(contract)}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end" style={{ gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                        {formatCurrency(contract.amount ?? 0)}
                      </span>
                      <ContractBadge status={contract.status} />
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

      </div>

      {/* Contract detail panel — opened from ?view= param or notification */}
      <AnimatePresence>
        {detailContract && (
          <ContractDetailPanel
            contract={detailContract}
            onClose={() => setDetailContract(null)}
          />
        )}
      </AnimatePresence>

    </AppShell>
  )
}

export default function ContractsPage() {
  return <Suspense><ContractsPageContent /></Suspense>
}
