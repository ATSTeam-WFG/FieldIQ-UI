import { useQuery } from '@tanstack/react-query'
import { getMyTeam } from '@/lib/api/teams'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useMyTeam() {
  return useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
