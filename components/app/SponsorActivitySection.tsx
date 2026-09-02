'use client'

import type { SponsorSpendItem } from '@/lib/api/analytics'

function InitialsAvatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      backgroundColor: '#c4a574', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, color: '#000',
    }}>
      {initials}
    </div>
  )
}

export function SponsorActivitySection({ items }: { items: SponsorSpendItem[] }) {
  return (
    <div className="app-card">
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <span className="font-semibold" style={{ fontSize: 14, color: 'var(--foreground)' }}>
          Sponsor Activity
        </span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            No sponsored activities this period.
          </p>
        </div>
      ) : (
        items.map((item, i) => (
          <div key={item.sponsorId} className="flex items-center" style={{
            padding: '12px 20px', gap: 12,
            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <InitialsAvatar initials={item.initials} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                  {item.sponsorName}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                  +${item.totalContributed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {item.activityCount} {item.activityCount === 1 ? 'event' : 'events'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {item.pctOfTotalSpend.toFixed(0)}% of your spend
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
