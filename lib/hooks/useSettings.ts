import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings, UserSettings } from '@/lib/api/settings'
import { useRole } from '@/lib/context/RoleContext'

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('fieldiq_token')
}

export function useSettings() {
  const { role } = useRole()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['settings', role],
    queryFn: () => getSettings(role),
    enabled: hasToken(),
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => updateSettings(role, patch),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', role], data)
    },
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    update: mutation.mutate,
  }
}
