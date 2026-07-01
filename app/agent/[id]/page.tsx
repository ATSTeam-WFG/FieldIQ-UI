'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/fieldiq/AppShell'
import { KPICard } from '@/components/fieldiq/KPICard'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgentDetail } from '@/lib/hooks/useAgentDetail'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

// ── Helpers ───────────────────────────────────────────────────────────────────

function repTierLabel(tier: string | null): string {
  if (!tier) return ''
  return tier === 'sales_rep' ? 'Sales Rep' : tier
}

function statusConfig(status: string) {
  if (status === 'on-track') return { label: 'On Track', color: '#16a34a' }
  if (status === 'watch') return { label: 'Watch', color: '#d97706' }
  return { label: 'Below Target', color: '#d97706' }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: '10px 14px', color: '#ffffff', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name === 'spend' ? `Spend: $${entry.value}` : `Activities: ${entry.value}`}
        </p>
      ))}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

// ── Error / not-found states ──────────────────────────────────────────────────

function StateCard({ title, message, onBack }: { title: string; message: string; onBack: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[8px]"
      style={{
        padding: '64px 24px',
        borderTop: '2px solid #c4a574',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 320, marginBottom: 20 }}>{message}</p>
      <button
        onClick={onBack}
        style={{ fontSize: 13, fontWeight: 600, color: '#c4a574', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← Back to Team
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data, isLoading, error } = useAgentDetail(params.id)

  const goBack = () => router.push('/team')

  if (isLoading) return <AppShell activeItem="Dashboard"><PageSkeleton /></AppShell>

  if (error) {
    const status = (error as any)?.status
    const title = status === 404 ? 'Rep not found' : 'Could not load rep data'
    const message = status === 403
      ? 'You do not have permission to view this rep.'
      : status === 404
      ? 'This rep does not exist or was removed.'
      : 'There was a problem loading the data. Please try again.'
    return (
      <AppShell activeItem="Dashboard">
        <div className="flex flex-col gap-4 p-6">
          <button onClick={goBack} style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', width: 'fit-content' }} className="hover:text-[var(--foreground)] transition-colors">
            ← Team
          </button>
          <StateCard title={title} message={message} onBack={goBack} />
        </div>
      </AppShell>
    )
  }

  if (!data) return null

  const { name, initials, title, territory, repTier, status, kpis, performance } = data
  const sc = statusConfig(status)
  const monthlySpend = performance.monthlySpend
  const breakdown = performance.activityBreakdown
  const maxCount = breakdown.reduce((m, r) => Math.max(m, r.count), 0)

  return (
    <AppShell activeItem="Dashboard">
      <div className="flex flex-col gap-4 p-6">

        {/* Breadcrumb */}
        <button
          onClick={goBack}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', width: 'fit-content' }}
          className="hover:text-[var(--foreground)] transition-colors"
        >
          ← Team
        </button>

        {/* Profile header */}
        <div
          className="rounded-[8px] flex items-center gap-4"
          style={{
            padding: '20px 24px',
            borderTop: '2px solid #c4a574',
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            borderLeft: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 48, height: 48, backgroundColor: '#c4a574', fontSize: 16, fontWeight: 700, color: '#000' }}
          >
            {initials.toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: 4 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.1 }}>{name}</h1>
              {repTier && (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>
                  {repTierLabel(repTier)}
                </span>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, backgroundColor: 'var(--surface)', border: `1px solid ${sc.color}33`, borderRadius: 4, padding: '2px 8px' }}>
                {sc.label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {[title, territory].filter(Boolean).join(' · ') || 'No title or territory set'}
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
          <KPICard
            label="ACTIVITIES THIS WEEK"
            value={String(kpis.activitiesThisWeek)}
            subLabel={kpis.activitiesWeekDelta}
            subLabelColor={kpis.activitiesWeekDeltaPositive ? '#16a34a' : '#d97706'}
          />
          <KPICard
            label="SPEND MTD"
            value={kpis.totalSpendMTD}
            subLabel={kpis.spendSubLabel}
          />
          <KPICard
            label="CONTACTS ENGAGED"
            value={String(kpis.contactsEngaged)}
            subLabel={kpis.contactsSubLabel}
          />
          <KPICard
            label="FOLLOW-UPS PENDING"
            value={String(kpis.followUpsPending)}
            subLabel={kpis.followUpsOverdue > 0 ? `${kpis.followUpsOverdue} overdue` : 'None overdue'}
            subLabelColor={kpis.followUpsOverdue > 0 ? '#d97706' : undefined}
          />
        </div>

        {/* Monthly Spend & Activity Trend */}
        <div className="fieldiq-card">
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>
              Spend &amp; Activity Trend · Last 6 Months
            </span>
          </div>
          <div style={{ padding: '20px 20px 12px' }}>
            {monthlySpend.length === 0 ? (
              <div className="flex items-center justify-center" style={{ height: 240 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>No activity data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={monthlySpend} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={52} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,165,116,0.06)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a1a1aa', paddingTop: 12 }} />
                  <Bar yAxisId="left" dataKey="spend" name="spend" fill="#c4a574" opacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="activities" name="activities" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#c4a574', stroke: '#c4a574', r: 4 }} activeDot={{ fill: '#c4a574', stroke: '#c4a574', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Type Breakdown */}
        <div className="fieldiq-card">
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>Activity Type Breakdown</span>
          </div>
          <div className="flex flex-col" style={{ padding: '16px 20px', gap: 8 }}>
            {breakdown.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No activities this month</p>
            ) : breakdown.map((row) => {
              const pct = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0
              return (
                <div key={row.type} className="flex items-center" style={{ height: 36, gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--body)', minWidth: 100, flexShrink: 0 }}>{row.type}</span>
                  <span className="flex items-center justify-center rounded-full shrink-0"
                    style={{ height: 20, minWidth: 28, paddingLeft: 8, paddingRight: 8, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {row.count}
                  </span>
                  <div className="flex-1 overflow-hidden" style={{ height: 8, borderRadius: 4, backgroundColor: 'var(--surface)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, backgroundColor: '#c4a574', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
