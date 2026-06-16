import { useQuery } from '@tanstack/react-query'
import { getScoreTrends } from '@/lib/api/contacts'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useScoreTrends() {
  return useQuery({
    queryKey: ['score-trends'],
    queryFn: getScoreTrends,
    enabled: hasToken(),
    staleTime: 5 * 60_000, // 5 min — trends don't change frequently
  })
}
