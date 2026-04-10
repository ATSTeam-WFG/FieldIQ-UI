import { useQuery } from '@tanstack/react-query'
import { getMyKpis } from '@/lib/api/agents'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useAgentKpis() {
  return useQuery({
    queryKey: ['agent-kpis'],
    queryFn: getMyKpis,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
