import { useQuery } from '@tanstack/react-query'
import { getAgentPerformance } from '@/lib/api/analytics'
import type { Period } from '@/lib/api/analytics'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useAgentPerformance(period: Period = 'mtd') {
  return useQuery({
    queryKey: ['agent-performance', period],
    queryFn: () => getAgentPerformance(period),
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
