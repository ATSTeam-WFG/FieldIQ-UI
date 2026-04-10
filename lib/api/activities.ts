import { api } from './client'
import type { ActivityRecord } from '@/lib/context/ActivityLogContext'

// Backend type label → frontend Title Case display label
const TYPE_DISPLAY: Record<string, string> = {
  lunch: 'Lunch',
  pop_by: 'Pop-by',
  ce_class: 'CE Class',
  coffee: 'Coffee',
  closing_gift: 'Closing Gift',
  call: 'Call',
  sponsorship: 'Sponsorship',
  other: 'Other',
}

// Frontend display label → backend enum value
export const TYPE_ENUM: Record<string, string> = {
  'Lunch': 'lunch',
  'Pop-by': 'pop_by',
  'CE Class': 'ce_class',
  'Coffee': 'coffee',
  'Closing Gift': 'closing_gift',
  'Call': 'call',
  'Sponsorship': 'sponsorship',
  'Other': 'other',
}

interface BackendActivity {
  id: string
  agent_id: string
  type: string
  date: string
  time: string | null
  notes: string | null
  spend: number
  label: string | null
  is_sponsored: boolean
  status: string
  receipt_url: string | null
  contact: { id: string; name: string; initials: string; company: string | null } | null
  sponsor: { id: string; name: string; initials: string; company: string | null } | null
  follow_up: { id: string; status: string; due_date: string | null; note: string | null } | null
  created_at: string
}

interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

function toActivityRecord(a: BackendActivity): ActivityRecord {
  const contact = a.contact
  const sponsor = a.sponsor
  return {
    id: a.id,
    agentName: '',
    agentInitials: '',
    type: TYPE_DISPLAY[a.type] ?? a.type,
    contactName: contact?.name ?? '',
    contactCompany: contact?.company ?? '',
    sponsored: a.is_sponsored,
    contacts: contact ? [{ id: contact.id, name: contact.name, initials: contact.initials, company: contact.company ?? '' }] : [],
    vendors: sponsor ? [{ name: sponsor.name, company: sponsor.company ?? '', coverage: 'Full', amount: '' }] : [],
    date: a.date,
    time: a.time ?? '',
    notes: a.notes ?? '',
    spend: Number(a.spend),
    followUp: a.follow_up?.note ?? '',
    status: a.status === 'follow_up' ? 'follow-up' : a.status,
    label: a.label ?? '',
    // Pass through raw backend fields for mutation purposes
    _raw: a,
  } as ActivityRecord & { _raw: BackendActivity }
}

export async function getActivities(params?: {
  type?: string
  status?: string
  contact_id?: string
  page?: number
  page_size?: number
}): Promise<{ items: ActivityRecord[]; total: number }> {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.status) qs.set('status', params.status)
  if (params?.contact_id) qs.set('contact_id', params.contact_id)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.page_size) qs.set('page_size', String(params.page_size))

  const path = `/activities/${qs.toString() ? '?' + qs.toString() : ''}`
  const data = await api.get<Page<BackendActivity>>(path)
  return { items: data.items.map(toActivityRecord), total: data.total }
}

export interface CreateActivityPayload {
  type: string           // backend enum value e.g. 'lunch'
  date: string           // ISO date string
  time?: string | null
  contact_id?: string | null
  sponsor_id?: string | null
  notes?: string | null
  spend?: number
  label?: string | null
  is_sponsored?: boolean
  follow_up_note?: string | null
  follow_up_due_date?: string | null
}

export async function createActivity(payload: CreateActivityPayload): Promise<ActivityRecord> {
  const data = await api.post<BackendActivity>('/activities/', payload)
  return toActivityRecord(data)
}
