import { useQuery } from '@tanstack/react-query'
import { getAgentDetail } from '@/lib/api/agents'
import { hasToken } from '@/lib/api/client'

export function useAgentDetail(agentId: string) {
  return useQuery({
    queryKey: ['agent-detail', agentId],
    queryFn: () => getAgentDetail(agentId),
    enabled: hasToken() && !!agentId,
    staleTime: 60_000,
  })
}
