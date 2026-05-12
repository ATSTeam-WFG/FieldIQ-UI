import { useQuery } from '@tanstack/react-query'
import { getMyAgency, type AgencyData } from '@/lib/api/agencies'
import { ApiError } from '@/lib/api/client'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useMyAgency() {
  return useQuery<AgencyData | null>({
    queryKey: ['my-agency'],
    queryFn: async () => {
      try {
        return await getMyAgency()
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }
    },
    enabled: hasToken(),
    staleTime: 300_000,
  })
}
