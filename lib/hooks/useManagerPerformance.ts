import { useQuery } from '@tanstack/react-query'
import { getTeamPerformance } from '@/lib/api/analytics'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useManagerPerformance() {
  return useQuery({
    queryKey: ['manager-performance'],
    queryFn: getTeamPerformance,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
