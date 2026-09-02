import { getToken } from '@/lib/api/client'
// Import engine — client layer. Talks to the real backend:
//   POST /import/contracts/preview  (multipart) → staged ImportPlan (nothing persisted)
//   POST /import/contracts/commit   (json)      → CommitResult (writes rows, enqueues scoring)
// Types mirror app/schemas/import_.py (camelCase via the backend's alias generator).
// Import history is kept client-side (localStorage) purely as a recent-activity list.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export type ImportPlatform = 'qualia' | 'softpro'
export type ImportOwner = 'you' | 'agency'

export interface FieldConflict {
  field: 'company' | 'email' | 'phone' | 'address'
  kept: string
  alternate: string
}

export interface StagedContact {
  key: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  subtype: 'buyer' | 'seller' | ''
  subtypeConflict: boolean
  sources: number
  matched: boolean
  matchedId: string | null
  possibleDuplicate: boolean
  conflicts: FieldConflict[]
  closingsDelta: number
  status: 'new' | 'review' | 'existing'
  include: boolean
}

export interface StagedContract {
  key: string
  orderNumber: string
  closeDate: string
  propertyAddress: string
  city: string
  amount: number | null
  loanAmount: number | null
  primaryKey: string | null
  secondaryKey: string | null
  referringKey: string | null
  sellerAgentKey: string | null
  buyerAgentKey: string | null
  duplicate: boolean
  duplicateAction: 'skip' | 'update'
  existingId: string | null
  errors: string[]
  status: 'new' | 'review' | 'existing'
  include: boolean
}

export interface ImportPlan {
  platform: ImportPlatform
  owner: ImportOwner
  fileName: string
  contacts: StagedContact[]
  contracts: StagedContract[]
  fileErrors: string[]
}

export interface CommitResult {
  contractsImported: number
  contractsSkipped: number
  contactsCreated: number
  contactsMerged: number
  contactsMatched: number
  errors: number
}

export interface ImportHistoryItem {
  id: string
  platform: ImportPlatform
  fileName: string
  imported: number
  contactsCreated: number
  generatedAt: string
}

// ── API calls ─────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function previewImport(file: File, source: ImportPlatform): Promise<ImportPlan> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('source', source)
  const res = await fetch(`${BASE}/import/contracts/preview`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  })
  if (!res.ok) throw new Error(`Preview failed: ${res.statusText}`)
  return res.json()
}

export async function commitImport(plan: ImportPlan): Promise<CommitResult> {
  const res = await fetch(`${BASE}/import/contracts/commit`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  })
  if (!res.ok) throw new Error(`Import failed: ${res.statusText}`)
  return res.json()
}

// ── History (recent imports shown on the page) ───────────────────────────────────

const HISTORY_KEY = 'app_import_history'
const MAX_HISTORY = 20

export function getImportHistory(): ImportHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addImportHistory(item: Omit<ImportHistoryItem, 'id' | 'generatedAt'>): void {
  const history = getImportHistory()
  const entry: ImportHistoryItem = { ...item, id: crypto.randomUUID(), generatedAt: new Date().toISOString() }
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, MAX_HISTORY)))
}

export function clearImportHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
