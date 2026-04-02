import { cn } from '@/lib/utils'

export type ActivityStatus = 'complete' | 'follow-up' | 'logged' | 'on-track' | 'watch' | 'below-target'

interface StatusBadgeProps {
  status: ActivityStatus
  className?: string
}

const statusConfig: Record<ActivityStatus, { label: string; color: string; border: string }> = {
  'follow-up': {
    label: 'Follow-up',
    color: '#c4a574',
    border: '#c4a574',
  },
  complete: {
    label: 'Complete',
    color: '#16a34a',
    border: '#16a34a',
  },
  logged: {
    label: 'Logged',
    color: 'var(--muted)',
    border: 'var(--border)',
  },
  'on-track': {
    label: 'On Track',
    color: '#16a34a',
    border: '#16a34a',
  },
  watch: {
    label: 'Watch',
    color: '#d97706',
    border: '#d97706',
  },
  'below-target': {
    label: 'Below Target',
    color: '#d97706',
    border: '#d97706',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-[4px] border px-2', className)}
      style={{
        height: 22,
        fontSize: 11,
        color: config.color,
        backgroundColor: 'transparent',
        borderColor: config.border,
      }}
    >
      {config.label}
    </span>
  )
}
