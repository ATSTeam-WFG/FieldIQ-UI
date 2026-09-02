import { useQuery } from '@tanstack/react-query'
import { getNudge } from '@/lib/api/agents'
import { hasToken } from '@/lib/api/client'

export function useAgentNudge() {
  return useQuery({
    queryKey: ['agent-nudge'],
    queryFn: getNudge,
    enabled: hasToken(),
    staleTime: 5 * 60_000,
  })
}
