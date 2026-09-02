import { useQuery } from '@tanstack/react-query'
import { getMyTeam } from '@/lib/api/teams'
import { hasToken } from '@/lib/api/client'

export function useMyTeam() {
  return useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
