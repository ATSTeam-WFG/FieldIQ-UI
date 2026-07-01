const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export type ExportType =
  | 'activities'
  | 'spend-summary'
  | 'contacts'
  | 'performance-snapshot'
  | 'team-activities'
  | 'team-performance'
  | 'at-risk-contacts'

export interface ExportFilters {
  activityTypes?: string[]
  status?: string
  contactTypes?: string[]
  minScore?: number
  maxScore?: number
  agentIds?: string[]
  scoreThreshold?: number
  dormancyThreshold?: number
}

export interface ExportHistoryItem {
  id: string
  type: ExportType
  label: string
  format: 'CSV' | 'PDF'
  period: string
  generatedAt: string
}

const HISTORY_KEY = 'fieldiq_export_history'
const MAX_HISTORY = 20

export function getExportHistory(): ExportHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addExportHistory(item: Omit<ExportHistoryItem, 'id' | 'generatedAt'>): void {
  const history = getExportHistory()
  const entry: ExportHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
  }
  const updated = [entry, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function clearExportHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export async function downloadCsv(
  type: ExportType,
  period: string,
  dateFrom?: string,
  dateTo?: string,
  filters?: ExportFilters,
): Promise<void> {
  const token = localStorage.getItem('fieldiq_token')
  const params = new URLSearchParams({ period })
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)

  // Multi-value params (appended, not set)
  filters?.activityTypes?.forEach(t => params.append('activity_types', t))
  filters?.contactTypes?.forEach(t => params.append('contact_types', t))
  filters?.agentIds?.forEach(id => params.append('agent_ids', id))
  if (filters?.status) params.set('status', filters.status)
  if (filters?.minScore !== undefined) params.set('min_score', String(filters.minScore))
  if (filters?.maxScore !== undefined) params.set('max_score', String(filters.maxScore))
  if (filters?.scoreThreshold !== undefined) params.set('score_threshold', String(filters.scoreThreshold))
  if (filters?.dormancyThreshold !== undefined) params.set('dormancy_threshold', String(filters.dormancyThreshold))

  const res = await fetch(`${BASE}/exports/${type}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const today = new Date().toISOString().slice(0, 10)
  a.download = `fieldiq-${type}-${period}-${today}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
