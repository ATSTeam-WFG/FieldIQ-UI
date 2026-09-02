import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createActivity, getActivities, type CreateActivityPayload } from '@/lib/api/activities'
import { hasToken } from '@/lib/api/client'

export function useActivities(params?: Parameters<typeof getActivities>[0]) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params),
    enabled: hasToken(),
    staleTime: 30_000,
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
      qc.invalidateQueries({ queryKey: ['agent-kpis'] })
    },
  })
}
