import { useQuery } from '@tanstack/react-query'
import { getMyKpis } from '@/lib/api/agents'
import { hasToken } from '@/lib/api/client'

export function useAgentKpis() {
  return useQuery({
    queryKey: ['agent-kpis'],
    queryFn: getMyKpis,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
