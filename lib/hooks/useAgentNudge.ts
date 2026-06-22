import { useQuery } from '@tanstack/react-query'
import { getNudge } from '@/lib/api/agents'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useAgentNudge() {
  return useQuery({
    queryKey: ['agent-nudge'],
    queryFn: getNudge,
    enabled: hasToken(),
    staleTime: 5 * 60_000,
  })
}
