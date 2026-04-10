import { api } from './client'

export interface FollowUp {
  id: string
  agent_id: string
  activity_id: string | null
  contact_id: string | null
  due_date: string | null
  note: string | null
  status: string
  completed_at: string | null
  created_at: string
  contact: { id: string; name: string; company: string | null } | null
}

interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export async function getFollowUps(params?: {
  status?: string
  overdue?: boolean
  page?: number
  page_size?: number
}): Promise<{ items: FollowUp[]; total: number }> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.overdue) qs.set('overdue', 'true')
  if (params?.page) qs.set('page', String(params.page))
  if (params?.page_size) qs.set('page_size', String(params.page_size))

  const path = `/follow-ups/${qs.toString() ? '?' + qs.toString() : ''}`
  const data = await api.get<Page<FollowUp>>(path)
  return { items: data.items, total: data.total }
}

export async function updateFollowUp(id: string, payload: {
  status?: string
  due_date?: string | null
  note?: string | null
}): Promise<FollowUp> {
  return api.put<FollowUp>(`/follow-ups/${id}`, payload)
}
