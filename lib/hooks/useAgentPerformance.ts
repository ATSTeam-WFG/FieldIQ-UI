import { useQuery } from '@tanstack/react-query'
import { getAgentPerformance } from '@/lib/api/analytics'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useAgentPerformance() {
  return useQuery({
    queryKey: ['agent-performance'],
    queryFn: getAgentPerformance,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
