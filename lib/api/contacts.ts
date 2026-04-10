import { api } from './client'

export interface Contact {
  id: string
  agent_id: string
  name: string
  initials: string
  company: string | null
  job_title: string | null
  type: string
  email: string | null
  phone: string | null
  score: number
  closings: number
  tags: string[]
  last_activity_type: string | null
  last_activity_date: string | null
  spend: number
  score_breakdown: {
    recency: string
    frequency: string
    diversity: string
    engagement: string
    computed_at: string
  } | null
  created_at: string
}

interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export async function getContacts(params?: {
  type?: string
  search?: string
  sort?: string
  page?: number
  page_size?: number
}): Promise<{ items: Contact[]; total: number }> {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.search) qs.set('search', params.search)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.page_size) qs.set('page_size', String(params.page_size))

  const path = `/contacts/${qs.toString() ? '?' + qs.toString() : ''}`
  const data = await api.get<Page<Contact>>(path)
  return { items: data.items, total: data.total }
}

export async function getContact(id: string): Promise<Contact> {
  return api.get<Contact>(`/contacts/${id}`)
}

export async function createContact(payload: {
  name: string
  company?: string | null
  job_title?: string | null
  type?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  tags?: string[]
}): Promise<Contact> {
  return api.post<Contact>('/contacts/', payload)
}

export async function updateContact(id: string, payload: Partial<{
  name: string
  company: string | null
  job_title: string | null
  type: string
  email: string | null
  phone: string | null
  address: string | null
  tags: string[]
}>): Promise<Contact> {
  return api.put<Contact>(`/contacts/${id}`, payload)
}
