'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronUp, ChevronDown, UserPlus, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { FilterSearchBar, FilterPills } from '@/components/fieldiq/FilterBar'
import type { FilterOption } from '@/components/fieldiq/FilterBar'
import { useAddContact } from '@/lib/context/AddContactContext'
import contactsData from '@/lib/mock-data/contacts.json'

interface Contact {
  id: string
  name: string
  initials: string
  company: string
  role: string
  type: 'agent' | 'vendor'
  score: number
  lastActivityType: string | null
  lastActivityDate: string | null
  tags: string[]
  spend: number
  closings: number
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ContactAvatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: '#c4a574',
        fontSize: size <= 32 ? 11 : 13,
        fontWeight: 700,
        color: '#000',
      }}
    >
      {initials}
    </div>
  )
}

function ScoreBadge({ score, type }: { score: number; type: string }) {
  if (type === 'vendor') {
    return <span style={{ color: 'var(--muted)', fontWeight: 600 }}>—</span>
  }
  const color =
    score >= 80 ? '#c4a574' : score >= 60 ? '#d97706' : 'var(--muted)'
  return (
    <span style={{ color, fontWeight: 700, fontSize: 14 }}>{score}</span>
  )
}

function ActivityCell({ type, date }: { type: string | null; date: string | null }) {
  if (!type || !date) {
    return <span style={{ color: 'var(--muted)' }}>—</span>
  }
  const d = new Date(date)
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <span style={{ color: 'var(--body)', fontSize: 13 }}>
      {type} · {formatted}
    </span>
  )
}

function TagChips({ tags, max = 2 }: { tags: string[]; max?: number }) {
  const shown = tags.slice(0, max)
  const overflow = tags.length - max
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map(tag => (
        <span
          key={tag}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--body)',
            padding: '1px 6px',
          }}
        >
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--muted)',
            padding: '1px 6px',
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        border: '1px solid var(--border)',
        borderRadius: 4,
        fontSize: 11,
        color: 'var(--muted)',
        padding: '2px 8px',
      }}
    >
      {type === 'agent' ? 'Agent' : 'Vendor'}
    </span>
  )
}

function SortableHeader({
  label,
  sortKey: key,
  currentKey,
  currentDir,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: string
  currentKey: string
  currentDir: 'asc' | 'desc'
  onSort: (key: string) => void
  align?: 'left' | 'right'
}) {
  const active = currentKey === key
  return (
    <button
      onClick={() => onSort(key)}
      className="flex items-center gap-0.5"
      style={{
        color: active ? 'var(--foreground)' : 'var(--muted)',
        fontWeight: active ? 600 : 400,
        fontSize: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      {label}
      {active ? (
        currentDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <ChevronDown size={12} style={{ opacity: 0.3 }} />
      )}
    </button>
  )
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      style={{ color: 'var(--muted)' }}
    >
      <Search size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
      <p style={{ fontSize: 14 }}>No contacts match your search</p>
    </div>
  )
}

// ── Mobile card row ──────────────────────────────────────────────────────────

function MobileContactRow({
  contact,
  activeTab,
  onClick,
}: {
  contact: Contact
  activeTab: 'all' | 'agents' | 'vendors'
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onTouchStart={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
      onTouchEnd={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Row 1: avatar + name/role + score/chevron */}
      <div className="flex items-center gap-3">
        <ContactAvatar initials={contact.initials} size={36} />
        <div className="flex flex-1 flex-col min-w-0" style={{ gap: 2 }}>
          <span
            className="truncate"
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}
          >
            {contact.name}
          </span>
          <span
            className="truncate"
            style={{ fontSize: 12, color: 'var(--muted)' }}
          >
            {contact.role}
          </span>
        </div>
        {/* Right side: score (or type badge) + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          {activeTab === 'all' ? (
            <TypeBadge type={contact.type} />
          ) : null}
          {contact.type === 'agent' && (
            <ScoreBadge score={contact.score} type={contact.type} />
          )}
          <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
        </div>
      </div>

      {/* Row 2: company */}
      <div style={{ marginTop: 6, paddingLeft: 48 }}>
        <span
          className="truncate block"
          style={{ fontSize: 12, color: 'var(--body)' }}
        >
          {contact.company}
        </span>
      </div>

      {/* Row 3: last activity + tags (agents only) or just tags */}
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{ marginTop: 6, paddingLeft: 48 }}
      >
        {contact.type === 'agent' && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {contact.lastActivityType && contact.lastActivityDate ? (
              <>
                {contact.lastActivityType} ·{' '}
                {new Date(contact.lastActivityDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </>
            ) : (
              'No activity'
            )}
          </span>
        )}
        <TagChips tags={contact.tags} max={2} />
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter()
  const { openAddContact } = useAddContact()
  const [activeTab, setActiveTab] = useState<'all' | 'agents' | 'vendors'>('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const allCount = contactsData.length
  const agentCount = contactsData.filter(c => c.type === 'agent').length
  const vendorCount = contactsData.filter(c => c.type === 'vendor').length

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const visibleContacts = useMemo(() => {
    let list = contactsData as Contact[]
    if (activeTab === 'agents') list = list.filter(c => c.type === 'agent')
    if (activeTab === 'vendors') list = list.filter(c => c.type === 'vendor')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey as keyof Contact]
      const bVal = b[sortKey as keyof Contact]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return list
  }, [activeTab, search, sortKey, sortDir])

  const tabs = [
    { key: 'all' as const,      label: `All ${allCount}` },
    { key: 'agents' as const,   label: `Agents ${agentCount}` },
    { key: 'vendors' as const, label: `Vendors ${vendorCount}` },
  ]

  function handleTabChange(key: 'all' | 'agents' | 'vendors') {
    setActiveTab(key)
    setSortKey(key === 'vendors' ? 'name' : 'score')
    setSortDir(key === 'vendors' ? 'asc' : 'desc')
  }

  const desktopColumns = {
    all:      '1fr 200px 90px 72px 160px 180px',
    agents:   '1fr 200px 72px 160px 80px 72px 180px',
    vendors: '1fr 200px 1fr',
  }

  return (
    <AppShell activeItem="Contacts">
      {/* Page header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>
            Contacts
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {allCount} contacts · Sarah Chen · Buckhead Territory
          </p>
        </div>
        <button
          onClick={openAddContact}
          className="flex items-center gap-1.5"
          style={{
            backgroundColor: '#c4a574',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <UserPlus size={14} />
          {/* Label hidden on very small screens */}
          <span className="hidden sm:inline">Add Contact</span>
        </button>
      </div>

      {/* Card wrapper */}
      <div
        className="fieldiq-card"
        style={{
          borderRadius: 8,
          border: '1px solid var(--border)',
          borderTop: '2px solid #c4a574',
          backgroundColor: 'var(--card)',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col gap-3 p-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <FilterSearchBar value={search} onChange={setSearch} placeholder="Search name or company…" />
          <FilterPills<'all' | 'agents' | 'vendors'>
            options={tabs.map(t => ({ value: t.key, label: t.label } as FilterOption<'all' | 'agents' | 'vendors'>))}
            value={activeTab}
            onChange={handleTabChange}
          />
        </div>

        {/* ── Mobile list (hidden on md+) ── */}
        <div className="md:hidden">
          {visibleContacts.length === 0 ? (
            <EmptyState />
          ) : (
            visibleContacts.map(contact => (
              <MobileContactRow
                key={contact.id}
                contact={contact}
                activeTab={activeTab}
                onClick={() => router.push(`/contacts/${contact.id}`)}
              />
            ))
          )}
        </div>

        {/* ── Desktop table (hidden on mobile) ── */}
        <div className="hidden md:block" style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: desktopColumns[activeTab],
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              padding: '0 16px',
              height: 40,
              alignItems: 'center',
              gap: 12,
            }}
          >
            {activeTab === 'all' && (
              <>
                <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Company" sortKey="company" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Type</span>
                <SortableHeader label="Score" sortKey="score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Last Activity" sortKey="lastActivityDate" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tags</span>
              </>
            )}
            {activeTab === 'agents' && (
              <>
                <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Company" sortKey="company" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Score" sortKey="score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Last Activity" sortKey="lastActivityDate" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Spend" sortKey="spend" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortableHeader label="Closings" sortKey="closings" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tags</span>
              </>
            )}
            {activeTab === 'vendors' && (
              <>
                <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Company" sortKey="company" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tags</span>
              </>
            )}
          </div>

          {/* Rows */}
          {visibleContacts.length === 0 ? (
            <EmptyState />
          ) : (
            visibleContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => router.push(`/contacts/${contact.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: desktopColumns[activeTab],
                  padding: '0 16px',
                  height: 56,
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ContactAvatar initials={contact.initials} />
                  <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
                    <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                      {contact.name}
                    </span>
                    <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {contact.role}
                    </span>
                  </div>
                </div>

                <span className="truncate" style={{ fontSize: 13, color: 'var(--body)' }}>
                  {contact.company}
                </span>

                {activeTab === 'all' && (
                  <>
                    <TypeBadge type={contact.type} />
                    <ScoreBadge score={contact.score} type={contact.type} />
                    <ActivityCell type={contact.lastActivityType} date={contact.lastActivityDate} />
                    <TagChips tags={contact.tags} />
                  </>
                )}

                {activeTab === 'agents' && (
                  <>
                    <ScoreBadge score={contact.score} type={contact.type} />
                    <ActivityCell type={contact.lastActivityType} date={contact.lastActivityDate} />
                    <span style={{ fontSize: 13, color: 'var(--body)', textAlign: 'right' }}>
                      ${contact.spend}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--body)', textAlign: 'right' }}>
                      {contact.closings}
                    </span>
                    <TagChips tags={contact.tags} />
                  </>
                )}

                {activeTab === 'vendors' && (
                  <TagChips tags={contact.tags} max={99} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
