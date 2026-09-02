import { useQuery } from '@tanstack/react-query'
import { getScoreTrends } from '@/lib/api/contacts'
import { hasToken } from '@/lib/api/client'

export function useScoreTrends() {
  return useQuery({
    queryKey: ['score-trends'],
    queryFn: getScoreTrends,
    enabled: hasToken(),
    staleTime: 5 * 60_000, // 5 min — trends don't change frequently
  })
}
