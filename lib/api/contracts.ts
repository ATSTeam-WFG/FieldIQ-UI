import { api } from './client'

export interface Contract {
  id: string
  agent_id: string
  contact_id: string | null
  title: string | null
  transaction_type: string
  status: string
  amount: number | null
  property_address: string | null
  file_number: string | null
  expected_closing_date: string | null
  actual_closing_date: string | null
  notes: string | null
  created_at: string
  contact: { id: string; name: string; company: string | null } | null
}

interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export async function getContracts(params?: {
  status?: string
  contact_id?: string
  page?: number
  page_size?: number
}): Promise<{ items: Contract[]; total: number }> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.contact_id) qs.set('contact_id', params.contact_id)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.page_size) qs.set('page_size', String(params.page_size))

  const path = `/contracts/${qs.toString() ? '?' + qs.toString() : ''}`
  const data = await api.get<Page<Contract>>(path)
  return { items: data.items, total: data.total }
}

export async function createContract(payload: {
  contact_id?: string | null
  title?: string | null
  transaction_type?: string
  status?: string
  amount?: number | null
  property_address?: string | null
  file_number?: string | null
  expected_closing_date?: string | null
  actual_closing_date?: string | null
  notes?: string | null
}): Promise<Contract> {
  return api.post<Contract>('/contracts/', payload)
}

export async function updateContract(id: string, payload: Partial<{
  contact_id: string | null
  title: string | null
  transaction_type: string
  status: string
  amount: number | null
  property_address: string | null
  file_number: string | null
  expected_closing_date: string | null
  actual_closing_date: string | null
  notes: string | null
}>): Promise<Contract> {
  return api.put<Contract>(`/contracts/${id}`, payload)
}
