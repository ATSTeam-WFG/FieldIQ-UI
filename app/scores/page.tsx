'use client'

import { AppShell } from '@/components/fieldiq/AppShell'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useContacts } from '@/lib/hooks/useContacts'
import type { Contact } from '@/lib/api/contacts'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const diffMs = new Date().getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
}

function levelColor(level: string): string {
  if (level === 'high') return '#16a34a'
  if (level === 'medium') return '#d97706'
  return 'var(--muted)'
}

function levelWidth(level: string): string {
  if (level === 'high') return '100%'
  if (level === 'medium') return '60%'
  return '30%'
}

// ── Small inline SVG score ring ────────────────────────────────────────────

function ScoreRingSmall({ score }: { score: number }) {
  const r = 18
  const circumference = 2 * Math.PI * r
  const arc = (score / 100) * circumference

  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      aria-label={`Score ${score}`}
    >
      {/* Background track */}
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#27272a"
        strokeWidth={4}
      />
      {/* Progress arc */}
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#c4a574"
        strokeWidth={4}
        strokeDasharray={`${arc} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      {/* Score label */}
      <text
        x={24}
        y={24}
        fontSize={11}
        fontWeight={700}
        fill="#c4a574"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
    </svg>
  )
}

// ── Score breakdown mini bars ──────────────────────────────────────────────

const BREAKDOWN_LABELS: Array<{ key: string; label: string }> = [
  { key: 'recency',    label: 'Recency' },
  { key: 'frequency',  label: 'Frequency' },
  { key: 'diversity',  label: 'Diversity' },
  { key: 'engagement', label: 'Engagement' },
]

type ScoreBreakdown = NonNullable<Contact['score_breakdown']>

function BreakdownBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 12px',
        width: 180,
      }}
    >
      {BREAKDOWN_LABELS.map(({ key, label }) => {
        const level = (breakdown as Record<string, string>)[key] ?? 'low'
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {label}
            </span>
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--surface)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: levelWidth(level),
                  height: '100%',
                  borderRadius: 2,
                  backgroundColor: levelColor(level),
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Trend icon ─────────────────────────────────────────────────────────────

function TrendIcon({ score }: { score: number }) {
  if (score >= 80) {
    return <TrendingUp size={16} style={{ color: '#16a34a' }} />
  }
  if (score >= 60) {
    return <Minus size={16} style={{ color: '#d97706' }} />
  }
  return <TrendingDown size={16} style={{ color: 'var(--muted)' }} />
}

// ── Score level dot for legend ─────────────────────────────────────────────

function LegendDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ScoresPage() {
  const { data, isLoading } = useContacts()

  const agents = (data?.items ?? [])
    .filter(c => c.type === 'agent')
    .sort((a, b) => b.score - a.score)

  const totalCount = agents.length
  const avgScore = totalCount > 0
    ? Math.round(agents.reduce((sum, c) => sum + c.score, 0) / totalCount)
    : 0
  const topContact = agents[0]

  // Table column header definitions
  const colHeaders = [
    { label: 'RANK',        width: 40  },
    { label: 'CONTACT',     width: 200 },
    { label: 'SCORE',       width: 80  },
    { label: 'BREAKDOWN',   width: 180 },
    { label: 'LAST CONTACT',width: 120 },
    { label: 'TREND',       width: 60  },
  ]

  return (
    <AppShell activeItem="Scores">
      <div className="flex flex-col" style={{ gap: 0 }}>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 4 }}>
          <h1
            className="font-semibold leading-tight"
            style={{ fontSize: 22, color: 'var(--foreground)' }}
          >
            Relationship Scores
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Agent contacts ranked by relationship score
          </p>
        </div>

        {/* ── Summary strip ───────────────────────────────────── */}
        <div
          className="flex flex-row flex-wrap"
          style={{ gap: 0, marginTop: 16, columnGap: 24, rowGap: 8 }}
        >
          {/* Avg Score */}
          <div className="flex flex-row items-baseline" style={{ gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Avg Score
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#c4a574', lineHeight: 1 }}>
              {avgScore}
            </span>
          </div>

          {/* Top Score */}
          <div className="flex flex-row items-baseline" style={{ gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Top Score
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#c4a574', lineHeight: 1 }}>
              {topContact ? `${topContact.score} — ${topContact.name}` : '—'}
            </span>
          </div>

          {/* Contacts Tracked */}
          <div className="flex flex-row items-baseline" style={{ gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Contacts Tracked
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#c4a574', lineHeight: 1 }}>
              {totalCount}
            </span>
          </div>
        </div>

        {/* ── Score legend ─────────────────────────────────────── */}
        <div
          className="flex flex-row flex-wrap items-center"
          style={{ gap: 16, marginTop: 8 }}
        >
          <div className="flex items-center" style={{ gap: 6 }}>
            <LegendDot color="#16a34a" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>High (80+)</span>
          </div>
          <div className="flex items-center" style={{ gap: 6 }}>
            <LegendDot color="#d97706" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Medium (60–79)</span>
          </div>
          <div className="flex items-center" style={{ gap: 6 }}>
            <LegendDot color="var(--muted)" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Low (&lt;60)</span>
          </div>
        </div>

        {/* ── Contacts table card ──────────────────────────────── */}
        <div
          className="fieldiq-card"
          style={{ marginTop: 16 }}
        >
          {/* Card header */}
          <div
            className="flex items-center"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              gap: 10,
            }}
          >
            <span
              className="font-semibold"
              style={{ fontSize: 14, color: 'var(--foreground)' }}
            >
              All Contacts
            </span>
            {/* Count badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 22,
                height: 20,
                paddingLeft: 7,
                paddingRight: 7,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: 'var(--surface)',
                color: 'var(--muted)',
              }}
            >
              {totalCount}
            </span>
          </div>

          {/* Table column headers — desktop only */}
          <div
            className="hidden md:flex items-center"
            style={{
              height: 32,
              padding: '0 20px',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {colHeaders.map(({ label, width }) => (
              <span
                key={label}
                style={{
                  width,
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Loading / empty state */}
          {isLoading && (
            <div className="flex items-center justify-center" style={{ padding: '48px 20px' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>Loading…</span>
            </div>
          )}
          {!isLoading && agents.length === 0 && (
            <div className="flex items-center justify-center" style={{ padding: '48px 20px' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>No contacts tracked yet.</span>
            </div>
          )}

          {/* Table rows */}
          {agents.map((contact, idx) => {
            const isLast = idx === agents.length - 1
            const breakdown = contact.score_breakdown

            return (
              <div
                key={contact.id}
                className="flex items-center"
                style={{
                  minHeight: 64,
                  padding: '0 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                }}
              >
                {/* RANK — desktop only */}
                <span
                  className="hidden md:block shrink-0"
                  style={{
                    width: 40,
                    fontSize: 13,
                    color: 'var(--muted)',
                  }}
                >
                  {idx + 1}
                </span>

                {/* CONTACT */}
                <div
                  className="flex shrink-0 items-center"
                  style={{ gap: 10, width: 200 }}
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#c4a574',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#000000',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {contact.initials}
                  </div>
                  <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
                    <span
                      className="truncate"
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}
                    >
                      {contact.name}
                    </span>
                    <span
                      className="truncate"
                      style={{ fontSize: 11, color: 'var(--muted)' }}
                    >
                      {contact.job_title ?? ''}
                    </span>
                  </div>
                </div>

                {/* SCORE — score ring on desktop, just number on mobile */}
                <div
                  style={{
                    width: 80,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="md:hidden" style={{ fontSize: 15, fontWeight: 700, color: '#c4a574' }}>
                    {contact.score}
                  </span>
                  <span className="hidden md:flex items-center justify-center">
                    <ScoreRingSmall score={contact.score} />
                  </span>
                </div>

                {/* BREAKDOWN — desktop only */}
                {breakdown && (
                  <div
                    className="hidden md:flex shrink-0 items-center"
                    style={{ width: 180 }}
                  >
                    <BreakdownBars breakdown={breakdown} />
                  </div>
                )}
                {!breakdown && (
                  <div
                    className="hidden md:block shrink-0"
                    style={{ width: 180, fontSize: 12, color: 'var(--muted)' }}
                  >
                    —
                  </div>
                )}

                {/* LAST CONTACT — desktop only */}
                <span
                  className="hidden md:block shrink-0"
                  style={{ width: 120, fontSize: 13, color: 'var(--muted)' }}
                >
                  {formatRelativeDate(contact.last_activity_date)}
                </span>

                {/* TREND — desktop only */}
                <div
                  className="hidden md:flex shrink-0 items-center"
                  style={{ width: 60 }}
                >
                  <TrendIcon score={contact.score} />
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </AppShell>
  )
}
