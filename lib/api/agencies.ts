import { api } from './client'

export async function registerAgency(payload: {
  name: string
  state?: string | null
  rep_count_range?: string | null
  website?: string | null
}): Promise<{ id: string }> {
  return api.post('/agencies', payload)
}

export async function createInvites(invites: {
  email: string
  full_name: string
  phone?: string | null
  rep_tier?: string
  welcome_note?: string | null
}[]): Promise<void> {
  await api.post('/invites', { invites })
}
