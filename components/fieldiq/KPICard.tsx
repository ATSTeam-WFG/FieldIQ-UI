import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  subLabel?: string
  subLabelColor?: string
  progressBar?: boolean
  progressValue?: number // 0–100
  className?: string
}

export function KPICard({
  label,
  value,
  subLabel,
  subLabelColor,
  progressBar,
  progressValue = 0,
  className,
}: KPICardProps) {
  return (
    <div className={cn('fieldiq-card p-5', className)}>
      {/* Label */}
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-[0.06em]"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-3xl font-bold leading-none"
        style={{ color: '#c4a574' }}
      >
        {value}
      </p>

      {/* SubLabel */}
      {subLabel && (
        <p
          className="mt-1.5 text-xs"
          style={{ color: subLabelColor ?? 'var(--muted)' }}
        >
          {subLabel}
        </p>
      )}

      {/* Progress bar */}
      {progressBar && (
        <div
          className="mt-3 h-1 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, progressValue))}%`,
              backgroundColor: '#c4a574',
            }}
          />
        </div>
      )}
    </div>
  )
}
