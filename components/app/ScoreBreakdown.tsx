interface ScoreBreakdownProps {
  breakdown: {
    recency: string
    frequency: string
    diversity: string
    engagement: string
  }
  stacked?: boolean
}

const LABELS = [
  { key: 'recency',    label: 'Recency'    },
  { key: 'frequency',  label: 'Frequency'  },
  { key: 'diversity',  label: 'Diversity'  },
  { key: 'engagement', label: 'Engagement' },
]

function levelColor(level: string): string {
  if (level === 'high')   return '#16a34a'
  if (level === 'medium') return '#d97706'
  return 'var(--muted)'
}

function levelWidth(level: string): string {
  if (level === 'high')   return '100%'
  if (level === 'medium') return '60%'
  return '30%'
}

export default function ScoreBreakdown({ breakdown, stacked = false }: ScoreBreakdownProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: stacked ? '1fr' : '1fr 1fr',
        gap: stacked ? '10px' : '8px 16px',
      }}
    >
      {LABELS.map(({ key, label }) => {
        const level = (breakdown as Record<string, string>)[key] ?? 'low'
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
            <div
              style={{
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
