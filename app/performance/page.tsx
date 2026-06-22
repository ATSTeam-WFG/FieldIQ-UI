'use client'

import { TrendingUp } from 'lucide-react'
import { AICard } from '@/components/fieldiq/AICard'
import { AppShell } from '@/components/fieldiq/AppShell'
import { KPICard } from '@/components/fieldiq/KPICard'
import { Skeleton } from '@/components/ui/skeleton'
import { useRole } from '@/lib/context/RoleContext'
import { useAgentKpis } from '@/lib/hooks/useAgentKpis'
import { useAgentNudge } from '@/lib/hooks/useAgentNudge'
import { useAgentPerformance } from '@/lib/hooks/useAgentPerformance'
import { useManagerPerformance } from '@/lib/hooks/useManagerPerformance'
import {
  BarChart,
  Bar as BarRecharts,
  XAxis as XAxisRecharts,
  YAxis as YAxisRecharts,
  CartesianGrid as CartesianGridRecharts,
  Tooltip as TooltipRecharts,
  ResponsiveContainer as ResponsiveContainerRecharts,
} from 'recharts'
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

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: '#171717',
        border: '1px solid #27272a',
        borderRadius: 8,
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: 13,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name === 'spend' ? `Spend: $${entry.value}` : `Activities: ${entry.value}`}
        </p>
      ))}
    </div>
  )
}

// ── Manager view ──────────────────────────────────────────────────────────────

function ManagerPerformancePage() {
  const { data, isLoading } = useManagerPerformance()

  const teamWeeklyData = data?.teamWeekly ?? []
  const activityTypeBreakdown = data?.activityBreakdown ?? []
  const agents = data?.agents ?? []
  const maxCount = activityTypeBreakdown.reduce((m, r) => Math.max(m, r.count), 0)

  return (
    <AppShell activeItem="Performance">
      <div className="flex flex-col">
        <div className="flex flex-col" style={{ gap: 4 }}>
          <h1 className="font-semibold leading-tight" style={{ fontSize: 22, color: 'var(--foreground)' }}>
            Team Performance
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Premier Title Agency · MTD
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginTop: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginTop: 24 }}>
            <KPICard label="TOTAL ACTIVITIES" value={String(data?.totalActivitiesMtd ?? 0)} subLabel="MTD" />
            <KPICard label="TOTAL SPEND" value={data ? `$${data.totalSpendMtd.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0'} subLabel="MTD" />
            <KPICard label="AVG SCORE" value={String(data?.avgScore ?? 0)} subLabel="Across team" />
            <KPICard label="MOST ACTIVE" value={data?.mostActiveAgent ?? '—'} subLabel="This month" />
          </div>
        )}

        <div className="flex flex-col md:flex-row" style={{ gap: 16, marginTop: 16 }}>
          <div className="fieldiq-card flex-1 min-w-0">
            <div className="flex items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>
                Team Activities by Week
              </span>
            </div>
            <div style={{ padding: '20px 20px 12px' }}>
              <ResponsiveContainerRecharts width="100%" height={240}>
                <BarChart data={teamWeeklyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGridRecharts strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxisRecharts dataKey="week" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxisRecharts tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={28} />
                  <TooltipRecharts
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #27272a', borderRadius: 8, fontSize: 13, color: '#fff' }}
                    cursor={{ fill: 'rgba(196,165,116,0.06)' }}
                  />
                  <BarRecharts dataKey="count" name="Activities" fill="#c4a574" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainerRecharts>
            </div>
          </div>

          <div className="fieldiq-card shrink-0 w-full md:w-[300px]">
            <div className="flex items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>
                Activity Type Breakdown
              </span>
            </div>
            <div className="flex flex-col" style={{ padding: '16px 20px', gap: 8 }}>
              {activityTypeBreakdown.map(row => {
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

        <div className="fieldiq-card" style={{ marginTop: 16 }}>
          <div className="flex items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: 10 }}>
            <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>Rep Performance</span>
            <span style={{ backgroundColor: 'var(--surface)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--muted)' }}>
              {agents.length}
            </span>
          </div>

          {/* Desktop table headers */}
          <div className="hidden md:grid" style={{ gridTemplateColumns: '48px 1fr 100px 80px', padding: '10px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            {['RANK', 'REP', 'ACTIVITIES', 'SCORE'].map(col => (
              <span key={col} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--muted)' }}>{col}</span>
            ))}
          </div>

          {agents.map((agent, i) => (
            <div key={agent.name}>
              {/* Desktop row */}
              <div className="hidden md:grid items-center" style={{ gridTemplateColumns: '48px 1fr 100px 80px', padding: '14px 20px', borderBottom: i < agents.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>#{i + 1}</span>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <div className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 32, height: 32, backgroundColor: '#c4a574', fontSize: 12, fontWeight: 700, color: '#000' }}>
                    {agent.initials.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{agent.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>{agent.activities}</span>
                <span style={{ fontSize: 13, color: 'var(--body)' }}>{agent.score || '—'}</span>
              </div>

              {/* Mobile card row */}
              <div className="flex md:hidden items-center justify-between"
                style={{ padding: '12px 20px', borderBottom: i < agents.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <div className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 32, height: 32, backgroundColor: '#c4a574', fontSize: 12, fontWeight: 700, color: '#000' }}>
                    {agent.initials.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{agent.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#c4a574' }}>{agent.activities}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

// ── Agent view ────────────────────────────────────────────────────────────────

function AgentPerformancePage() {
  const { data, isLoading } = useAgentPerformance()
  const { data: kpis } = useAgentKpis()
  const { data: nudge } = useAgentNudge()

  const monthlySpend = data?.monthlySpend ?? []
  const activityTypeBreakdown = data?.activityBreakdown ?? []
  const maxCount = activityTypeBreakdown.reduce((m, r) => Math.max(m, r.count), 0)

  const activitiesMtd = data?.activitiesMtd ?? 0
  const spendMtd = data?.spendMtd ?? 0
  const contactsEngaged = data?.contactsEngaged ?? 0
  const mostActiveType = data?.mostActiveType ?? '—'
  const avgCost = data?.avgCostPerActivity ?? 0

  return (
    <AppShell activeItem="My Performance">
      <div className="flex flex-col">

        {/* ── Page header ───────────────────────────────── */}
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center rounded-[8px] shrink-0"
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <TrendingUp size={18} style={{ color: '#c4a574' }} />
          </div>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <h1
              className="font-semibold leading-tight"
              style={{ fontSize: 22, color: 'var(--foreground)' }}
            >
              My Performance
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Sarah Chen · Buckhead Territory · MTD
            </p>
          </div>
        </div>

        {/* ── AI Performance Summary ────────────────────── */}
        <div style={{ marginTop: 20 }}>
          <AICard label="Summary" sublabel="Updated today" readAloud>
            <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.6, margin: 0 }}>
              This month you&apos;ve logged {activitiesMtd} {activitiesMtd === 1 ? 'activity' : 'activities'}.
              {kpis?.topContactName
                ? ` Your strongest relationship is ${kpis.topContactName} (score ${kpis.topRelationshipScore}).`
                : ''}
              {nudge
                ? ` ${nudge.message}`
                : ' All your key relationships are looking healthy.'}
            </p>
          </AICard>
        </div>

        {/* ── KPI row ───────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginTop: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: 16, marginTop: 24 }}
          >
            <KPICard
              label="ACTIVITIES THIS MONTH"
              value={String(activitiesMtd)}
              subLabel="vs 20 target"
              subLabelColor={activitiesMtd >= 20 ? '#16a34a' : '#d97706'}
              href="/activities"
            />
            <KPICard
              label="TOTAL SPEND"
              value={`$${spendMtd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              subLabel={avgCost > 0 ? `Avg $${avgCost.toFixed(0)}/activity` : 'No spend yet'}
              href="/activities"
            />
            <KPICard
              label="CONTACTS ENGAGED"
              value={String(contactsEngaged)}
              subLabel="This month"
              href="/contacts"
            />
            <KPICard
              label="MOST ACTIVE TYPE"
              value={mostActiveType}
              subLabel="This month"
              subLabelColor="#c4a574"
              href="/activities"
            />
          </div>
        )}

        {/* ── Spend & Activity Trend ────────────────────── */}
        <div
          className="fieldiq-card"
          style={{ marginTop: 24 }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
          >
            <span
              className="font-semibold"
              style={{ fontSize: 14, color: 'var(--foreground)' }}
            >
              Spend &amp; Activity Trend · Last 6 Months
            </span>
          </div>

          {/* Chart */}
          <div style={{ padding: '20px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={monthlySpend} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={52}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,165,116,0.06)' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: '#a1a1aa', paddingTop: 12 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="spend"
                  name="spend"
                  fill="#c4a574"
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="activities"
                  name="activities"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: '#c4a574', stroke: '#c4a574', r: 4 }}
                  activeDot={{ fill: '#c4a574', stroke: '#c4a574', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Two-column row ────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row"
          style={{ gap: 16, marginTop: 16 }}
        >
          {/* ─ Activity Type Breakdown ────────────────── */}
          <div className="fieldiq-card flex-1 min-w-0">
            {/* Card header */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <span
                className="font-semibold"
                style={{ fontSize: 14, color: 'var(--foreground)' }}
              >
                Activity Type Breakdown
              </span>
            </div>

            {/* Bars */}
            <div className="flex flex-col" style={{ padding: '16px 20px', gap: 8 }}>
              {activityTypeBreakdown.map((row) => {
                const pct = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0
                return (
                  <div
                    key={row.type}
                    className="flex items-center"
                    style={{ height: 36, gap: 12 }}
                  >
                    {/* Label */}
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--body)',
                        minWidth: 100,
                        flexShrink: 0,
                      }}
                    >
                      {row.type}
                    </span>

                    {/* Count badge */}
                    <span
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        height: 20,
                        minWidth: 28,
                        paddingLeft: 8,
                        paddingRight: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: 'var(--surface)',
                        color: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {row.count}
                    </span>

                    {/* Bar track */}
                    <div
                      className="flex-1 overflow-hidden"
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'var(--surface)',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 4,
                          backgroundColor: '#c4a574',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {/* Spend */}
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--muted)',
                        minWidth: 48,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {row.spend > 0 ? `$${row.spend.toLocaleString()}` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─ Quick Stats ────────────────────────────── */}
          <div
            className="fieldiq-card shrink-0 w-full md:w-[300px]"
          >
            <div>
              {/* Card header */}
              <div
                className="flex items-center"
                style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="font-semibold"
                  style={{ fontSize: 14, color: 'var(--foreground)' }}
                >
                  Quick Stats
                </span>
              </div>

              {/* Stat rows */}
              <div className="flex flex-col" style={{ padding: '4px 20px' }}>
                {[
                  { label: 'Most active type',   value: mostActiveType,                                  gold: true  },
                  { label: 'Avg cost / activity', value: avgCost > 0 ? `$${avgCost.toFixed(0)}` : '—',  gold: true  },
                  { label: 'Contacts engaged',    value: String(contactsEngaged),                         gold: true  },
                  { label: 'Activities on track', value: activitiesMtd >= 20 ? '✓ On Track' : 'Below target', gold: false, green: activitiesMtd >= 20 },
                ].map(({ label, value, gold, green }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                    style={{
                      height: 44,
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: gold || green ? 600 : 400,
                        color: green ? '#16a34a' : gold ? '#c4a574' : 'var(--body)',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const { role } = useRole()

  if (role === 'manager') {
    return <ManagerPerformancePage />
  }

  return <AgentPerformancePage />
}
