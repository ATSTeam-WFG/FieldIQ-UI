import { useQuery } from '@tanstack/react-query'
import { getManagerDashboard, type Period } from '@/lib/api/analytics'
import { hasToken } from '@/lib/api/client'

export function useManagerDashboard(period: Period = 'mtd') {
  return useQuery({
    queryKey: ['manager-dashboard', period],
    queryFn: () => getManagerDashboard(period),
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
