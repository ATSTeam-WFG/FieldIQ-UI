'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAgentPerformance } from '@/lib/hooks/useAgentPerformance'
import { useAgentKpis } from '@/lib/hooks/useAgentKpis'
import { useActivityHeatmap } from '@/lib/hooks/useActivityHeatmap'
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
  const { data, isLoading } = useAgentPerformance(period)
  const { data: kpis } = useAgentKpis()
  const { data: heatmapData } = useActivityHeatmap(period)

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  const activities = data?.activitiesMtd ?? 0
  const spend = data?.spendMtd ?? 0
  const contacts = data?.contactsEngaged ?? 0
  const efficiency = data?.efficiency

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
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Performance Report</h1>
        <p style={{ fontSize: 13, color: '#666' }}>
          {period.toUpperCase()} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Activities', value: activities },
          { label: 'Total Spend', value: `$${spend.toLocaleString()}` },
          { label: 'Contacts Engaged', value: contacts },
          { label: 'Efficiency Score', value: efficiency?.efficiencyScore ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="report-card" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#c4a574' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Activity breakdown */}
      {data?.activityBreakdown && data.activityBreakdown.length > 0 && (
        <div className="report-card" style={{ padding: '16px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Activity Breakdown</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--muted)', fontWeight: 500 }}>Type</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--muted)', fontWeight: 500 }}>Count</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--muted)', fontWeight: 500 }}>Spend</th>
              </tr>
            </thead>
            <tbody>
              {data.activityBreakdown.map(row => (
                <tr key={row.type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 8px' }}>{row.type}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>{row.count}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>${row.spend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Efficiency summary */}
      {efficiency && (
        <div className="report-card" style={{ padding: '16px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Spend Efficiency</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Efficiency Score', value: `${efficiency.efficiencyScore}/100` },
              { label: '$/Closing', value: efficiency.spendPerClosing ? `$${efficiency.spendPerClosing.toFixed(0)}` : '—' },
              { label: 'Activities/Closing', value: efficiency.activitiesPerClosing ? efficiency.activitiesPerClosing.toFixed(1) : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#c4a574' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading report data…</div>
      )}
    </>
  )
}

export default function PerformanceReportPage() {
  return (
    <Suspense>
      <ReportContent />
    </Suspense>
  )
}
