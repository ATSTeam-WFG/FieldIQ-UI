'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useManagerPerformance } from '@/lib/hooks/useManagerPerformance'
import type { Period } from '@/lib/api/analytics'

function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        height: 36, padding: '0 16px', borderRadius: 6,
        background: '#c4a574', color: '#000', border: 'none',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}
    >
      Print / Save PDF
    </button>
  )
}

function ReportContent() {
  const searchParams = useSearchParams()
  const period = (searchParams.get('period') ?? 'ytd') as Period
  const { data, isLoading } = useManagerPerformance(period)

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  const agents = data?.agents ?? []
  const totalActivities = agents.reduce((s: number, a) => s + a.activities, 0)
  const totalSpend = data?.totalSpendMtd ?? 0

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .report-card { border: 1px solid #ccc !important; break-inside: avoid; }
        }
        body { font-family: Inter, sans-serif; padding: 24px; max-width: 900px; margin: 0 auto; }
      `}</style>

      <PrintButton />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Team Performance Report</h1>
        <p style={{ fontSize: 13, color: '#666' }}>
          {period.toUpperCase()} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Team summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Activities', value: totalActivities },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}` },
          { label: 'Agents', value: agents.length },
        ].map(({ label, value }) => (
          <div key={label} className="report-card" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#c4a574' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Agent leaderboard table */}
      {agents.length > 0 && (
        <div className="report-card" style={{ padding: '16px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Agent Leaderboard</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Agent', 'Activities', 'Spend', 'Score', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: h === '#' || h === 'Agent' ? 'left' : 'right', padding: '4px 8px', color: 'var(--muted)', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, i: number) => (
                <tr key={agent.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 8px', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '8px 8px', fontWeight: 500 }}>{agent.name}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>{agent.activities}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>—</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: '#c4a574', fontWeight: 600 }}>{agent.score}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11 }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading report data…</div>
      )}
    </>
  )
}

export default function TeamReportPage() {
  return (
    <Suspense>
      <ReportContent />
    </Suspense>
  )
}
