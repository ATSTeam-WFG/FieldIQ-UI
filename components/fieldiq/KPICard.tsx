import Link from 'next/link'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  subLabel?: string
  subLabelColor?: string
  progressBar?: boolean
  progressValue?: number // 0–100
  className?: string
  href?: string
  onClick?: () => void
}

export function KPICard({
  label,
  value,
  subLabel,
  subLabelColor,
  progressBar,
  progressValue = 0,
  className,
  href,
  onClick,
}: KPICardProps) {
  const isClickable = !!(href || onClick)
  const inner = (
    <div
      className={cn('fieldiq-card p-3 md:p-5', isClickable && 'hover:opacity-90 transition-opacity', className)}
      style={isClickable ? { cursor: 'pointer' } : undefined}
      onClick={onClick}
    >
      {/* Label */}
      <p
        className="mb-1 md:mb-2 text-[10px] md:text-xs font-semibold uppercase leading-tight tracking-[0.05em]"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-2xl md:text-3xl font-bold leading-none"
        style={{ color: '#c4a574' }}
      >
        {value}
      </p>

      {/* SubLabel */}
      {subLabel && (
        <p
          className="mt-1 md:mt-1.5 text-[10px] md:text-xs"
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
  if (href) {
    return <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>
  }
  return inner
}
