import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFollowUps, updateFollowUp } from '@/lib/api/follow-ups'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useFollowUps(params?: Parameters<typeof getFollowUps>[0]) {
  return useQuery({
    queryKey: ['follow-ups', params],
    queryFn: () => getFollowUps(params),
    enabled: hasToken(),
    staleTime: 30_000,
  })
}

export function useUpdateFollowUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateFollowUp>[1] }) =>
      updateFollowUp(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] })
      qc.invalidateQueries({ queryKey: ['agent-kpis'] })
    },
  })
}
