'use client'

import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Building2, MessageCircle, CalendarPlus, Flag } from 'lucide-react'
import { AppShell } from '@/components/fieldiq/AppShell'
import { StatusBadge } from '@/components/fieldiq/StatusBadge'
import { ScoreRing } from '@/components/fieldiq/ScoreRing'
import type { ActivityStatus } from '@/components/fieldiq/StatusBadge'
import agentDetails from '@/lib/mock-data/agent-details.json'

type RelLevel = 'High' | 'Medium' | 'Low'

const relColor: Record<RelLevel, string> = {
  High: '#16a34a',
  Medium: '#d97706',
  Low: '#d97706',
}

const activityTypeColors: Record<string, string> = {
  Lunch: '#c4a574',
  'Pop-by': '#a68751',
  Coffee: '#c4a574',
  'CE Class': '#a68751',
  'Closing Gift': '#c4a574',
  Call: '#a68751',
  Sponsorship: '#c4a574',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatJoined(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const years = now.getFullYear() - d.getFullYear()
  const yearsLabel = years === 1 ? '1 year' : `${years} years`
  return `Joined ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · ${yearsLabel}`
}

// Shared card shell — gold top border, card bg
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[8px] ${className}`}
      style={{
        borderTop: '2px solid #c4a574',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: 44, paddingLeft: 16, paddingRight: 16, borderBottom: '1px solid var(--border)' }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{title}</span>
      {subtitle && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</span>}
    </div>
  )
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const agent = agentDetails.find(a => a.id === Number(params.id))

  if (!agent) return notFound()

  const { kpi, weeklyTrend, weeklyTarget, spendBreakdown, recentActivity } = agent
  const maxWeekCount = Math.max(...weeklyTrend.map(w => w.count), weeklyTarget)
  const maxSpend = Math.max(...spendBreakdown.map(s => s.amount))
  const totalSpend = spendBreakdown.reduce((s, b) => s + b.amount, 0)
  const mtdDelta = kpi.activitiesMTD - kpi.activitiesTarget
  const isAboveTarget = mtdDelta >= 0

  return (
    <AppShell activeItem="Dashboard">
      <div className="flex flex-col gap-4 p-6">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/manager')}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', width: 'fit-content' }}
          className="hover:text-[var(--foreground)] transition-colors"
        >
          ← Team Leaderboard
        </button>

        {/* Page header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.1 }}>
            {agent.name}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>
            Agent Detail · Manager View
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="flex w-full flex-col gap-4 lg:w-[352px] lg:shrink-0">

            {/* Agent Identity Card */}
            <Card>
              {/* Avatar */}
              <div className="flex justify-center pt-5 pb-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 56, height: 56, backgroundColor: '#c4a574' }}
                >
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#000000' }}>
                    {agent.initials}
                  </span>
                </div>
              </div>

              {/* Name + role + badges */}
              <div className="flex flex-col items-center gap-1 pb-4" style={{ paddingLeft: 16, paddingRight: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--foreground)', textAlign: 'center' }}>
                  {agent.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  {agent.role} · {agent.agency}
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="rounded-[6px] px-2"
                    style={{ fontSize: 11, height: 22, display: 'flex', alignItems: 'center', color: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    {agent.territory}
                  </span>
                  <StatusBadge status={agent.status as ActivityStatus} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

              {/* Contact details */}
              <div className="flex flex-col gap-[10px]" style={{ padding: '14px 16px' }}>
                <div className="flex items-center gap-2">
                  <Mail size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--body)' }}>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--body)' }}>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--body)' }}>{formatJoined(agent.joined)}</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

              {/* Action buttons */}
              <div className="flex flex-col gap-2" style={{ padding: '12px 16px 16px' }}>
                <button
                  onClick={() => router.push('/coming-soon')}
                  className="flex items-center justify-center gap-2 rounded-[8px] transition-colors hover:opacity-90"
                  style={{ height: 44, backgroundColor: '#c4a574', fontSize: 13, fontWeight: 600, color: '#000000' }}
                >
                  <MessageCircle size={14} />
                  Message {agent.name.split(' ')[0]}
                </button>
                <button
                  onClick={() => router.push('/coming-soon')}
                  className="flex items-center justify-center gap-2 rounded-[8px] transition-colors hover:bg-[var(--surface)]"
                  style={{ height: 44, border: '1px solid #c4a574', fontSize: 13, fontWeight: 500, color: '#c4a574' }}
                >
                  <CalendarPlus size={14} />
                  Schedule Check-in
                </button>
                <button
                  onClick={() => router.push('/coming-soon')}
                  className="flex items-center justify-center gap-2 rounded-[8px] transition-colors hover:bg-[var(--surface)]"
                  style={{ height: 40, border: '1px solid #d97706', fontSize: 13, color: '#d97706' }}
                >
                  <Flag size={14} />
                  Flag for Review
                </button>
              </div>
            </Card>

            {/* Performance Snapshot */}
            <Card>
              <CardHeader title="Performance Snapshot" />
              <div className="flex flex-col" style={{ padding: '8px 16px 12px' }}>
                {/* Rank */}
                <div
                  className="flex items-center justify-between"
                  style={{ height: 36, borderBottom: '1px solid var(--border)' }}
                >
                  <span style={{ fontSize: 13, color: 'var(--body)' }}>Rank on Team</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                    #{agent.rank} of {agent.totalAgents}
                  </span>
                </div>

                {/* MTD vs target */}
                <div
                  className="flex flex-col gap-[2px]"
                  style={{ paddingTop: 6, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: 'var(--body)' }}>MTD vs Target</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                      {kpi.activitiesMTD} / {kpi.activitiesTarget}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: isAboveTarget ? '#16a34a' : '#d97706' }}>
                    {isAboveTarget
                      ? `↑ ${Math.round((mtdDelta / kpi.activitiesTarget) * 100)}% above target`
                      : `↓ ${Math.abs(mtdDelta)} below target`}
                  </span>
                </div>

                {/* Avg spend */}
                <div
                  className="flex items-center justify-between"
                  style={{ height: 36, borderBottom: '1px solid var(--border)' }}
                >
                  <span style={{ fontSize: 13, color: 'var(--body)' }}>Avg Spend / Activity</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                    ${kpi.avgSpendPerActivity.toLocaleString()}
                  </span>
                </div>

                {/* Days since last log */}
                <div className="flex flex-col gap-[2px]" style={{ paddingTop: 6 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 13, color: 'var(--body)' }}>Days Since Last Log</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: kpi.daysLastLog === 0 ? '#16a34a' : kpi.daysLastLog <= 3 ? 'var(--foreground)' : '#d97706' }}>
                      {kpi.daysLastLog === 0 ? '0 days' : `${kpi.daysLastLog} days`}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: kpi.daysLastLog === 0 ? '#16a34a' : kpi.daysLastLog <= 3 ? 'var(--muted)' : '#d97706' }}>
                    {kpi.daysLastLog === 0 ? 'Logged today' : kpi.daysLastLog <= 3 ? `${kpi.daysLastLog}d ago` : 'Needs attention'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Relationship Health */}
            <Card>
              <CardHeader title="Relationship Health" subtitle={`${kpi.contactsActive} contacts`} />
              <div className="flex flex-col gap-3" style={{ padding: '16px 16px 12px' }}>
                {/* Score ring */}
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={agent.relationshipScore} size={80} strokeWidth={8} />
                  <div
                    className="flex items-center gap-[6px] rounded-full px-3"
                    style={{ height: 24, border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#c4a574' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#c4a574' }}>
                      {kpi.contactsActive} contacts
                    </span>
                  </div>
                </div>

                {/* Breakdown rows */}
                <div className="flex flex-col">
                  {(
                    [
                      ['Recency', agent.relationshipBreakdown.recency],
                      ['Frequency', agent.relationshipBreakdown.frequency],
                      ['Diversity', agent.relationshipBreakdown.diversity],
                      ['Follow-through', agent.relationshipBreakdown.followThrough],
                    ] as [string, RelLevel][]
                  ).map(([label, value], i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-2"
                      style={{
                        height: 32,
                        borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : undefined,
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: relColor[value] }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Top contact */}
                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                  Top contact: {agent.topContact.name} · {agent.topContact.score}/100
                </p>
              </div>
            </Card>

            {/* Spend Breakdown */}
            <Card>
              <div style={{ padding: '14px 16px 16px' }}>
                <div className="flex flex-col gap-[2px]" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                    Spend Breakdown
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    MTD · {kpi.activitiesMTD} activities
                  </span>
                </div>

                <div className="flex flex-col gap-[10px]">
                  {spendBreakdown.map(item => {
                    const pct = maxSpend > 0 ? (item.amount / maxSpend) * 100 : 0
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <span
                          style={{ width: 80, fontSize: 12, color: 'var(--body)', flexShrink: 0 }}
                        >
                          {item.type}
                        </span>
                        <div
                          className="relative flex-1 overflow-hidden rounded-[3px]"
                          style={{ height: 6, backgroundColor: 'var(--surface)' }}
                        >
                          <div
                            className="h-full rounded-[3px]"
                            style={{ width: `${pct}%`, backgroundColor: '#c4a574' }}
                          />
                        </div>
                        <span
                          style={{ width: 44, fontSize: 12, color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}
                        >
                          ${item.amount}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '12px 0' }} />

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--body)' }}>Total Invested</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>
                    ${totalSpend.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">

            {/* KPI mini-cards */}
            <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-4">
              {[
                { label: 'Activities MTD', value: String(kpi.activitiesMTD), gold: true },
                { label: 'Total Spend MTD', value: `$${kpi.totalSpendMTD.toLocaleString()}`, gold: false },
                { label: 'Contacts Active', value: String(kpi.contactsActive), gold: false },
                { label: 'Activity Streak', value: `${kpi.activityStreak} days`, gold: true },
              ].map(k => (
                <div
                  key={k.label}
                  className="flex flex-col gap-[6px] rounded-[8px]"
                  style={{
                    padding: '11px 13px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                >
                  <span
                    style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.4px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    {k.label}
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: k.gold ? '#c4a574' : 'var(--foreground)', lineHeight: 1 }}>
                    {k.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Activity Trend */}
            <Card>
              <div style={{ padding: '16px 16px 20px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                    Activity Trend
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#c4a574' }}>4W</span>
                </div>

                {/* Bar chart */}
                <div className="relative" style={{ height: 160 }}>
                  {/* Target line */}
                  <div
                    className="absolute w-full"
                    style={{
                      bottom: `${(weeklyTarget / maxWeekCount) * 100}%`,
                      height: 1,
                      borderTop: '1px dashed var(--muted)',
                      opacity: 0.5,
                    }}
                  />
                  <span
                    className="absolute right-0"
                    style={{
                      bottom: `calc(${(weeklyTarget / maxWeekCount) * 100}% + 4px)`,
                      fontSize: 10,
                      color: 'var(--muted)',
                    }}
                  >
                    Target
                  </span>

                  {/* Bars */}
                  <div className="flex h-full items-end gap-3 pr-14">
                    {weeklyTrend.map(w => {
                      const heightPct = maxWeekCount > 0 ? (w.count / maxWeekCount) * 100 : 0
                      return (
                        <div
                          key={w.week}
                          className="flex flex-1 flex-col items-center gap-1 justify-end"
                          style={{ height: '100%' }}
                        >
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{w.count}</span>
                          <div
                            className="w-full max-w-[44px] rounded-t-[4px] transition-all"
                            style={{ height: `${heightPct}%`, backgroundColor: '#c4a574' }}
                          />
                          <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{w.week}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                  Target: {weeklyTarget} activities / week
                </p>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader title="Recent Activity" subtitle={`${recentActivity.length} activities`} />
              <div className="flex flex-col gap-3" style={{ padding: '16px 16px 8px' }}>
                {recentActivity.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-[10px]"
                    style={{
                      paddingBottom: idx < recentActivity.length - 1 ? 12 : 0,
                      borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: idx < 3 ? '#c4a574' : 'var(--muted)',
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-[2px] min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-[6px] min-w-0">
                          <span
                            className="rounded-[4px] px-[6px] shrink-0"
                            style={{
                              height: 20,
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: 10,
                              fontWeight: 600,
                              color: activityTypeColors[entry.type] ?? '#c4a574',
                              border: `1px solid ${activityTypeColors[entry.type] ?? '#c4a574'}`,
                              opacity: 0.85,
                            }}
                          >
                            {entry.type}
                          </span>
                          <span
                            className="truncate"
                            style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)' }}
                          >
                            {entry.contact}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="truncate"
                          style={{ fontSize: 11, color: 'var(--muted)' }}
                        >
                          {entry.note}
                        </span>
                        <div className="flex items-center gap-[6px] shrink-0">
                          {entry.spend > 0 && (
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                              ${entry.spend}
                            </span>
                          )}
                          <StatusBadge status={entry.status as ActivityStatus} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="flex items-center justify-center"
                style={{ height: 40, borderTop: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => router.push('/coming-soon')}
                  style={{ fontSize: 12, color: '#c4a574' }}
                  className="hover:underline"
                >
                  Load more →
                </button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </AppShell>
  )
}
