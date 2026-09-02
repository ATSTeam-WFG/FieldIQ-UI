import { useQuery } from '@tanstack/react-query'
import { getTeamPerformance } from '@/lib/api/analytics'
import type { Period } from '@/lib/api/analytics'
import { hasToken } from '@/lib/api/client'

export function useManagerPerformance(period: Period = 'mtd') {
  return useQuery({
    queryKey: ['manager-performance', period],
    queryFn: () => getTeamPerformance(period),
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
