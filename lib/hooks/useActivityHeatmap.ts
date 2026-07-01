'use client'

import { useQuery } from '@tanstack/react-query'
import { getActivityDays } from '@/lib/api/analytics'
import type { Period } from '@/lib/api/analytics'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useActivityHeatmap(period: Period = 'mtd') {
  return useQuery({
    queryKey: ['activity-heatmap', period],
    queryFn: () => getActivityDays(period),
    enabled: hasToken(),
    staleTime: 60_000,
  })
}
