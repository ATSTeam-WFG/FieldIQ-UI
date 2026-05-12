import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonRowsProps {
  cols?: number
  rows?: number
}

export function SkeletonRows({ cols = 4, rows = 8 }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5"
          style={{ height: 52, borderBottom: '1px solid var(--border)' }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-4"
              style={{ flex: j === 0 ? 1.5 : 1 }}
            />
          ))}
        </div>
      ))}
    </>
  )
}
