'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Utensils,
  Gift,
  GraduationCap,
  Coffee,
  Package,
  Phone,
  Star,
  Circle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { StatusBadge } from '@/components/fieldiq/StatusBadge'
import type { ActivityStatus } from '@/components/fieldiq/StatusBadge'
import { FilterSearchBar, FilterPills, FilterDropdown } from '@/components/fieldiq/FilterBar'
import type { FilterOption } from '@/components/fieldiq/FilterBar'
import { SkeletonRows } from '@/components/fieldiq/SkeletonRows'
import { useActivityLog } from '@/lib/context/ActivityLogContext'
import { useRole } from '@/lib/context/RoleContext'
import { useActivities } from '@/lib/hooks/useActivities'

// ── Icon map ──────────────────────────────────────────────────────────────────

const activityIconMap: Record<string, LucideIcon> = {
  'Lunch':        Utensils,
  'Pop-by':       Gift,
  'CE Class':     GraduationCap,
  'Coffee':       Coffee,
  'Closing Gift': Package,
  'Call':         Phone,
  'Sponsorship':  Star,
  'Other':        Circle,
}

// ── Filter options ────────────────────────────────────────────────────────────

const TYPE_FILTERS = ['All', 'Lunch', 'Pop-by', 'Coffee', 'CE Class', 'Closing Gift', 'Sponsorship', 'Call'] as const
const STATUS_FILTERS = ['All', 'Follow-up', 'Complete', 'Logged'] as const

type TypeFilter   = typeof TYPE_FILTERS[number]
type StatusFilter = typeof STATUS_FILTERS[number]

const TYPE_OPTIONS: FilterOption<TypeFilter>[]   = TYPE_FILTERS.map(t => ({ value: t, label: t }))
const STATUS_OPTIONS: FilterOption<StatusFilter>[] = STATUS_FILTERS.map(s => ({ value: s, label: s }))

// ── Helper ────────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date     = new Date(dateStr)
  const now      = new Date(2026, 2, 16) // March 16, 2026
  const diffMs   = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)   return `${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const { openLog, openActivity } = useActivityLog()
  const { role } = useRole()
  const isManager = role === 'manager'

  const [selectedType,   setSelectedType]   = useState<TypeFilter>('All')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [searchQuery,    setSearchQuery]    = useState('')

  const { data: activitiesResult, isLoading } = useActivities({ page_size: 100 })
  const allActivities = activitiesResult?.items ?? []

  // Derived stats
  const totalSpend    = allActivities.reduce((sum, a) => sum + (a.spend ?? 0), 0)
  const followUpCount = allActivities.filter(a => a.status === 'follow-up').length

  // Filtered rows (client-side for now)
  const filteredActivities = allActivities.filter(act => {
    const q = searchQuery.toLowerCase()
    const contactSearchStr = act.contacts.map(c => `${c.name} ${c.company}`).join(' ')
    const searchMatch = !q ||
      act.type.toLowerCase().includes(q) ||
      contactSearchStr.toLowerCase().includes(q) ||
      (act.label ?? '').toLowerCase().includes(q) ||
      act.notes.toLowerCase().includes(q)
    const typeMatch   = selectedType === 'All' || act.type === selectedType
    const statusMatch =
      selectedStatus === 'All' ||
      (selectedStatus === 'Follow-up' && act.status === 'follow-up') ||
      (selectedStatus === 'Complete'  && act.status === 'complete')  ||
      (selectedStatus === 'Logged'    && act.status === 'logged')
    return searchMatch && typeMatch && statusMatch
  })

  return (
    <AppShell activeItem="Activities">
      <div className="flex flex-col" style={{ gap: 0 }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col" style={{ gap: 4 }}>
            <h1
              className="font-semibold leading-tight"
              style={{ fontSize: 22, color: 'var(--foreground)' }}
            >
              Activities
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              All logged activity · MTD
            </p>
          </div>

          {/* Log Activity CTA */}
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
            }}
          >
            <Plus size={14} color="#000000" />
            Log Activity
          </button>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 10, marginTop: 16 }}>
          <FilterSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search activities…" />
          <FilterDropdown label="TYPE" options={TYPE_OPTIONS} value={selectedType} onChange={setSelectedType} />
          <FilterPills options={STATUS_OPTIONS} value={selectedStatus} onChange={setSelectedStatus} />
        </div>

        {/* ── Summary stats row ───────────────────────────────────────────── */}
        <div
          className="flex items-center"
          style={{ gap: 24, marginTop: 16 }}
        >
          <div className="flex items-baseline" style={{ gap: 6 }}>
            <span
              className="font-semibold"
              style={{ fontSize: 15, color: '#c4a574' }}
            >
              {activitiesResult?.total ?? allActivities.length}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>activities</span>
          </div>

          <div
            style={{
              width: 1,
              height: 14,
              backgroundColor: 'var(--border)',
            }}
          />

          <div className="flex items-baseline" style={{ gap: 6 }}>
            <span
              className="font-semibold"
              style={{ fontSize: 15, color: '#c4a574' }}
            >
              ${totalSpend.toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>total spend</span>
          </div>

          <div
            style={{
              width: 1,
              height: 14,
              backgroundColor: 'var(--border)',
            }}
          />

          <div className="flex items-baseline" style={{ gap: 6 }}>
            <span
              className="font-semibold"
              style={{ fontSize: 15, color: '#c4a574' }}
            >
              {followUpCount}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>follow-ups pending</span>
          </div>
        </div>

        {/* ── Activity log card ───────────────────────────────────────────── */}
        <div
          className="fieldiq-card"
          style={{ marginTop: 16 }}
        >
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
                Activity Log
              </span>
              {/* Count badge */}
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
                {filteredActivities.length}
              </span>
            </div>
          </div>

          {/* Table header — hidden on mobile */}
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
              { label: 'TYPE',      flex: 1.2 },
              ...(isManager ? [{ label: 'REP', flex: 1.4 }] : []),
              { label: 'CONTACT',   flex: 1.8 },
              { label: 'LABEL',     flex: 2.0 },
              { label: 'DATE',      flex: 1.0 },
              { label: 'COST',      flex: 0.7 },
              { label: 'STATUS',    flex: 1.0 },
              { label: 'SPONSORED', flex: 0.7 },
            ]).map(col => (
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

          {/* Table rows */}
          {isLoading ? (
            <SkeletonRows cols={5} rows={8} />
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((act, idx) => {
              const Icon   = activityIconMap[act.type] ?? Circle
              const isLast = idx === filteredActivities.length - 1

              return (
                <motion.div
                  key={act.id}
                  onClick={() => openActivity(act as any)}
                  className="flex items-center transition-colors hover:bg-[var(--surface)]"
                  style={{
                    height: 56,
                    padding: '0 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx, 9) * 0.04, duration: 0.15 }}
                >
                  {/* TYPE */}
                  <div
                    className="flex items-center"
                    style={{ gap: 6, flex: 1.2, minWidth: 0 }}
                  >
                    <Icon size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                      {act.type}
                    </span>
                  </div>

                  {/* AGENT — manager only, desktop */}
                  {isManager && (
                    <div
                      className="hidden md:flex items-center"
                      style={{ gap: 8, flex: 1.4, minWidth: 0 }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: '#c4a574', fontSize: 9, fontWeight: 600, color: '#000000' }}
                      >
                        {(act as any).agentInitials}
                      </div>
                      <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                        {(act as any).agentName}
                      </span>
                    </div>
                  )}

                  {/* CONTACT — full layout on desktop */}
                  {(() => {
                    const contacts = (act as any).contacts as Array<{ name: string; company: string }> | undefined
                    const primary = contacts?.[0] ?? { name: act.contactName, company: act.contactCompany }
                    const overflow = contacts ? contacts.length - 1 : 0
                    return (
                      <div
                        className="hidden md:flex flex-col justify-center"
                        style={{ gap: 2, flex: 1.8, minWidth: 0 }}
                      >
                        <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                          {primary.name}{overflow > 0 ? ` + ${overflow}` : ''}
                        </span>
                        <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {primary.company}
                        </span>
                      </div>
                    )
                  })()}

                  {/* LABEL */}
                  <div
                    className="hidden md:flex items-center"
                    style={{ flex: 2.0, minWidth: 0 }}
                  >
                    <span className="truncate" style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {(act as any).label || '—'}
                    </span>
                  </div>

                  {/* DATE */}
                  <span
                    className="hidden md:block"
                    style={{ fontSize: 13, color: 'var(--muted)', flex: 1.0, minWidth: 0 }}
                  >
                    {formatRelativeDate(act.date)}
                  </span>

                  {/* COST */}
                  <span
                    className="hidden md:block"
                    style={{ fontSize: 13, color: 'var(--body)', flex: 0.7, minWidth: 0 }}
                  >
                    {act.spend > 0 ? `$${act.spend}` : '—'}
                  </span>

                  {/* STATUS */}
                  <div className="hidden md:flex items-center" style={{ flex: 1.0, minWidth: 0 }}>
                    <StatusBadge status={act.status as ActivityStatus} />
                  </div>

                  {/* SPONSORED */}
                  {(() => {
                    const vendors = (act as any).vendors as Array<{ name: string }> | undefined
                    let sponsorLabel: string
                    if (!vendors || vendors.length === 0) {
                      sponsorLabel = '—'
                    } else if (vendors.length === 1) {
                      sponsorLabel = vendors[0].name
                    } else {
                      sponsorLabel = `${vendors[0].name} + ${vendors.length - 1}`
                    }
                    return (
                      <div
                        className="hidden md:flex items-center"
                        style={{ flex: 0.7, minWidth: 0 }}
                      >
                        <span
                          className="truncate"
                          style={{ fontSize: 13, color: sponsorLabel === '—' ? 'var(--muted)' : 'var(--body)' }}
                        >
                          {sponsorLabel}
                        </span>
                      </div>
                    )
                  })()}

                  {/* Mobile: contact + status stacked */}
                  <div className="flex flex-1 items-center justify-between md:hidden">
                    <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
                      {(() => {
                        const contacts = (act as any).contacts as Array<{ name: string }> | undefined
                        const primary = contacts?.[0]?.name ?? act.contactName
                        const overflow = contacts ? contacts.length - 1 : 0
                        return (
                          <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                            {primary}{overflow > 0 ? ` + ${overflow}` : ''}
                          </span>
                        )
                      })()}
                      <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {isManager ? `${(act as any).agentName} · ` : ''}{formatRelativeDate(act.date)}
                      </span>
                    </div>
                    <StatusBadge status={act.status as ActivityStatus} />
                  </div>
                </motion.div>
              )
            })
          ) : (
            /* Empty state */
            <div
              className="flex items-center justify-center"
              style={{ height: 120 }}
            >
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                No activities match your filters
              </span>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  )
}
