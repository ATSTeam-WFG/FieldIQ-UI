import { useQuery } from '@tanstack/react-query'
import { getAgentDetail } from '@/lib/api/agents'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useAgentDetail(agentId: string) {
  return useQuery({
    queryKey: ['agent-detail', agentId],
    queryFn: () => getAgentDetail(agentId),
    enabled: hasToken() && !!agentId,
    staleTime: 60_000,
  })
}
