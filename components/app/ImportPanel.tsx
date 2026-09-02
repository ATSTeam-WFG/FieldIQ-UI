'use client'

import { useState, useRef } from 'react'
import {
  X, UploadCloud, FileText, Users, FileSpreadsheet, CheckCircle2, AlertTriangle,
  RotateCcw, ChevronLeft, ChevronDown, ChevronUp,
} from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import { FieldLabel } from './FieldLabel'
import {
  previewImport, commitImport,
  type ImportPlatform, type ImportOwner, type ImportPlan, type StagedContact,
  type StagedContract, type CommitResult, type ImportHistoryItem,
} from '@/lib/api/imports'
import { toast } from '@/lib/hooks/use-toast'

const GOLD = '#c4a574'
const AMBER = '#d97706'
const GREEN = '#16a34a'

type Status = 'new' | 'review' | 'existing'
const STATUS_RANK: Record<Status, number> = { new: 0, review: 1, existing: 2 }

// tone per status → { text color, bg, border }
const TONE: Record<Status, { c: string; bg: string; bd: string }> = {
  new:      { c: GREEN, bg: 'rgba(22,163,74,0.12)',  bd: 'rgba(22,163,74,0.35)' },
  review:   { c: AMBER, bg: 'rgba(217,119,6,0.12)',  bd: 'rgba(217,119,6,0.35)' },
  existing: { c: 'var(--muted)', bg: 'var(--surface)', bd: 'var(--border)' },
}

const CONTACT_LABEL: Record<Status, string> = { new: 'New', review: 'Possible match', existing: 'Already imported' }
const CONTACT_GROUP: Record<Status, string> = { new: 'New contacts', review: 'Needs review', existing: 'Already imported' }
const CONTRACT_LABEL: Record<Status, string> = { new: 'New', review: 'Needs Review', existing: 'Already imported' }
const CONTRACT_GROUP: Record<Status, string> = { new: 'New contracts', review: 'Needs Review', existing: 'Already imported' }

const IMPORTED: { icon: React.ElementType; title: string; desc: string; bullets: { tone: Status; label: string; text: string }[] }[] = [
  {
    icon: FileText, title: 'Contracts',
    desc: 'Each closed order becomes a contract with its property address, amount and close date.',
    bullets: [
      { tone: 'new', label: 'New', text: 'orders not yet imported, selected to import by default.' },
      { tone: 'existing', label: 'Already imported', text: 'orders you brought in before, skipped unless you choose to update them.' },
    ],
  },
  {
    icon: Users, title: 'Contacts',
    desc: 'The seller and buyer agents on each deal, de-duplicated and linked to their contracts automatically.',
    bullets: [
      { tone: 'new', label: 'New', text: 'agents not in your book yet, selected to import by default.' },
      { tone: 'review', label: 'Needs review', text: 'same name as a contact you already have but different details, so you decide.' },
      { tone: 'existing', label: 'Already imported', text: 'matched to an existing contact, linked to the deal and never duplicated.' },
    ],
  },
]

export interface PlatformCard {
  platform: ImportPlatform
  name: string
  description: string
  icon: React.ElementType
  status: 'active' | 'soon'
}

interface ImportPanelProps {
  platform: PlatformCard
  owner: ImportOwner
  agencyName: string
  onClose: () => void
  onCommitted: (item: Omit<ImportHistoryItem, 'id' | 'generatedAt'>) => void
}

// ── formatting ──────────────────────────────────────────────────────────────────

const fmtBytes = (n: number) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`
const fmtMoney = (n: number | null) => n == null ? '—' : `$${n.toLocaleString('en-US')}`
function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const contactNeedsReview = (c: StagedContact) => c.conflicts.length > 0 || c.possibleDuplicate || c.subtypeConflict

function StatusPill({ status, label }: { status: Status; label: string }) {
  const t = TONE[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', backgroundColor: t.bg, color: t.c, border: `1px solid ${t.bd}` }}>
      {label}
    </span>
  )
}

function GroupHeader({ label, color, count, collapsed, onToggle }: {
  label: string; color: string; count: number; collapsed: boolean; onToggle: () => void
}) {
  return (
    <button type="button" onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 2px', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {count}</span>
      {collapsed ? <ChevronDown size={13} color="var(--muted)" style={{ marginLeft: 2 }} /> : <ChevronUp size={13} color="var(--muted)" style={{ marginLeft: 2 }} />}
    </button>
  )
}

// Full-width segmented toggle (matches the Buyer/Seller control in contact creation).
function Segmented({ options, value, onChange }: {
  options: { value: string; label: string }[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-[8px]" style={{ border: '1px solid var(--border)', height: 40 }}>
      {options.map((o, i) => {
        const active = value === o.value
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className="flex flex-1 items-center justify-center transition-colors"
            style={{
              fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
              backgroundColor: active ? GOLD : 'var(--surface)', color: active ? '#000' : 'var(--muted)',
              border: 'none', borderRight: i < options.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function groupByStatus<T extends { status: Status }>(items: T[]): { status: Status; items: T[] }[] {
  const order: Status[] = ['new', 'review', 'existing']
  return order
    .map(status => ({ status, items: items.filter(i => i.status === status) }))
    .filter(g => g.items.length > 0)
}

// ── contract card ──────────────────────────────────────────────────────────────

function Role({ label, name, tone = 'body' }: { label: string; name: string | null; tone?: 'body' | 'gold' }) {
  if (!name) return null
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.7 }}>
      <span style={{ color: 'var(--muted)', width: 84, flexShrink: 0 }}>{label}</span>
      <span style={{ color: tone === 'gold' ? GOLD : 'var(--body)', fontWeight: 500 }}>{name}</span>
    </div>
  )
}

function ContractCard({ ct, nameOf, onToggle, onAction }: {
  ct: StagedContract
  nameOf: (key: string | null) => string | null
  onToggle: () => void
  onAction: (a: 'skip' | 'update') => void
}) {
  const st = ct.status as Status
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${st === 'review' ? TONE.review.bd : 'var(--border)'}`, backgroundColor: ct.include ? 'var(--surface)' : 'transparent', opacity: ct.include ? 1 : 0.55, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <input type="checkbox" checked={ct.include} onChange={onToggle} style={{ marginTop: 3, accentColor: GOLD, cursor: 'pointer', width: 15, height: 15 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Order #{ct.orderNumber}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                {[ct.propertyAddress, ct.city].filter(Boolean).join(', ') || '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--body)', fontWeight: 500, marginTop: 2 }}>
                {fmtMoney(ct.amount)}{ct.loanAmount != null ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · Refinanced {fmtMoney(ct.loanAmount)}</span> : null}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <StatusPill status={st} label={CONTRACT_LABEL[st]} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(ct.closeDate)}</span>
            </div>
          </div>
          <div style={{ marginTop: 10 }} />
          <Role label="Seller agent" name={nameOf(ct.sellerAgentKey)} />
          <Role label="Buyer agent" name={nameOf(ct.buyerAgentKey)} />
          <Role label="Referred by" name={nameOf(ct.referringKey)} tone="gold" />
          {ct.duplicate && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>This order has already been imported:</div>
              <Segmented
                options={[{ value: 'skip', label: 'Skip it' }, { value: 'update', label: 'Update it' }]}
                value={ct.duplicateAction}
                onChange={v => onAction(v as 'skip' | 'update')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── contact card ───────────────────────────────────────────────────────────────

function ContactCard({ c, expanded, onToggleExpand, onToggleInclude, onResolve, onSubtype }: {
  c: StagedContact
  expanded: boolean
  onToggleExpand: () => void
  onToggleInclude: () => void
  onResolve: (field: StagedContact['conflicts'][number]['field'], value: string) => void
  onSubtype: (v: 'buyer' | 'seller') => void
}) {
  const st = c.status as Status
  const review = contactNeedsReview(c)
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${st === 'review' ? TONE.review.bd : 'var(--border)'}`, backgroundColor: c.include ? 'var(--surface)' : 'transparent', opacity: c.include ? 1 : 0.55, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <input type="checkbox" checked={c.include} onChange={onToggleInclude} style={{ marginTop: 3, accentColor: GOLD, cursor: 'pointer', width: 15, height: 15 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</span>
              {c.subtype && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{c.subtype === 'seller' ? 'Seller agent' : 'Buyer agent'}</span>}
              {st !== 'review' && <StatusPill status={st} label={CONTACT_LABEL[st]} />}
            </div>
            {(review || st === 'review') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                {review && (
                  <button type="button" onClick={onToggleExpand}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: AMBER, fontSize: 12, fontWeight: 600, padding: 0 }}>
                    <AlertTriangle size={13} /> Review {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
                {st === 'review' && <StatusPill status={st} label={CONTACT_LABEL[st]} />}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {[c.company, c.email, c.phone].filter(Boolean).join(' · ') || 'No other details'}
          </div>

          {review && expanded && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {c.possibleDuplicate && (
                <div style={{ fontSize: 12, color: 'var(--body)', lineHeight: 1.5 }}>
                  <AlertTriangle size={12} color={AMBER} style={{ display: 'inline', marginRight: 5, verticalAlign: '-1px' }} />
                  A contact named <strong>{c.name}</strong> already exists.
                </div>
              )}
              {c.conflicts.map(cf => (
                <div key={cf.field}>
                  <div style={{ fontSize: 12, color: 'var(--body)', marginBottom: 6, textTransform: 'capitalize' }}>
                    Two {cf.field} values — keep which one?
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[cf.kept, cf.alternate].map(v => {
                      const active = c[cf.field] === v
                      return (
                        <button key={v} type="button" onClick={() => onResolve(cf.field, v)}
                          style={{
                            fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                            border: active ? `1px solid ${GOLD}` : '1px solid var(--border)',
                            background: active ? 'rgba(196,165,116,0.12)' : 'var(--card)',
                            color: active ? GOLD : 'var(--body)', fontWeight: active ? 600 : 400,
                          }}>
                          {v}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>The other is saved to this contact&apos;s tags — nothing is lost.</div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: 12, color: 'var(--body)', marginBottom: 6 }}>This agent is primarily a:</div>
                <Segmented
                  options={[{ value: 'seller', label: 'Seller agent' }, { value: 'buyer', label: 'Buyer agent' }]}
                  value={c.subtype}
                  onChange={v => onSubtype(v as 'buyer' | 'seller')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────

export function ImportPanel({ platform, owner, onClose, onCommitted }: ImportPanelProps) {
  const Icon = platform.icon
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [result, setResult] = useState<CommitResult | null>(null)
  const [openReview, setOpenReview] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function pickFile(f: File | null) {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) {
      toast({ title: 'Unsupported file', description: 'Please upload a .csv export.', variant: 'destructive' })
      return
    }
    setFile(f)
  }

  async function handleReview() {
    if (!file) return
    setLoading(true)
    try {
      const p = await previewImport(file, platform.platform)
      if (p.fileErrors.length) {
        toast({ title: 'Could not read file', description: p.fileErrors[0], variant: 'destructive' })
        return
      }
      setPlan(p)
      setStep('review')
    } catch {
      toast({ title: 'Import failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!plan) return
    setLoading(true)
    try {
      const res = await commitImport(plan)
      setResult(res)
      setStep('done')
      onCommitted({
        platform: platform.platform,
        fileName: plan.fileName,
        imported: res.contractsImported,
        contactsCreated: res.contactsCreated + res.contactsMerged,
      })
      toast({ title: 'Import complete', description: `${res.contractsImported} contract${res.contractsImported === 1 ? '' : 's'} imported.` })
    } catch {
      toast({ title: 'Import failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null); setPlan(null); setResult(null); setStep('upload'); setOpenReview(new Set())
    if (inputRef.current) inputRef.current.value = ''
  }

  // plan editors
  const toggleContact = (key: string) => setPlan(p => p && ({ ...p, contacts: p.contacts.map(c => c.key === key ? { ...c, include: !c.include } : c) }))
  const toggleContract = (key: string) => setPlan(p => p && ({ ...p, contracts: p.contracts.map(c => c.key === key ? { ...c, include: !c.include } : c) }))
  const setDupAction = (key: string, a: 'skip' | 'update') => setPlan(p => p && ({ ...p, contracts: p.contracts.map(c => c.key === key ? { ...c, duplicateAction: a, include: true } : c) }))
  const setSubtype = (key: string, v: 'buyer' | 'seller') => setPlan(p => p && ({ ...p, contacts: p.contacts.map(c => c.key === key ? { ...c, subtype: v } : c) }))
  const resolveConflict = (contactKey: string, field: StagedContact['conflicts'][number]['field'], value: string) =>
    setPlan(p => p && ({
      ...p, contacts: p.contacts.map(c => {
        if (c.key !== contactKey) return c
        return {
          ...c, [field]: value,
          conflicts: c.conflicts.map(cf => cf.field === field ? { ...cf, kept: value, alternate: value === cf.kept ? cf.alternate : cf.kept } : cf),
        }
      }),
    }))
  const toggleExpand = (key: string) => setOpenReview(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })
  const toggleGroup = (key: string) => setCollapsed(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const nameOf = (key: string | null) => key ? (plan?.contacts.find(c => c.key === key)?.name ?? null) : null

  const contractsIncl = plan?.contracts.filter(c => c.include && !(c.duplicate && c.duplicateAction === 'skip')) ?? []
  const contactGroups = plan ? groupByStatus(plan.contacts) : []
  const contractGroups = plan ? groupByStatus(plan.contracts) : []

  return (
    <SlideOverPanel onClose={onClose} width={780}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color="var(--muted)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Import from {platform.name}</span>
            <p className="hidden md:block" style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', lineHeight: 1.4 }}>
              Import closed orders and referral contacts from a {platform.name} CSV export to {owner === 'agency' ? 'your agency' : 'your account'}.
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color="var(--muted)" />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px' }}>
        {step === 'upload' && (
          <>
            <div style={{ marginBottom: 10 }}><FieldLabel>SOURCE FILE</FieldLabel></div>
            <input ref={inputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => pickFile(e.target.files?.[0] ?? null)} />
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '32px 20px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: `1.5px dashed ${dragging ? GOLD : 'var(--border)'}`,
                backgroundColor: dragging ? 'rgba(196,165,116,0.06)' : 'var(--surface)', transition: 'border-color 0.15s, background 0.15s',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {file ? <FileSpreadsheet size={20} color={GOLD} /> : <UploadCloud size={20} color="var(--muted)" />}
              </div>
              {file ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', wordBreak: 'break-all' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtBytes(file.size)} · click to replace</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>Drop your CSV here, or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{platform.name} order export · .csv only</div>
                </>
              )}
            </div>

            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '20px 0' }} />
            <div style={{ marginBottom: 10 }}><FieldLabel>WHAT GETS IMPORTED</FieldLabel></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {IMPORTED.map(r => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 8, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <r.icon size={16} color={GOLD} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: 2 }}>{r.desc}</div>
                    <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {r.bullets.map(b => (
                        <li key={b.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.45, color: 'var(--muted)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: TONE[b.tone].c, marginTop: 5, flexShrink: 0 }} />
                          <span><strong style={{ color: TONE[b.tone].c, fontWeight: 600 }}>{b.label}:</strong> {b.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'review' && plan && (
          <>
            {/* summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, fontSize: 13, color: 'var(--muted)' }}>
              <span><strong style={{ color: 'var(--foreground)' }}>{plan.contracts.length}</strong> contracts</span>
              <span>·</span>
              <span><strong style={{ color: 'var(--foreground)' }}>{plan.contacts.length}</strong> contacts</span>
            </div>

            {/* CONTRACTS first */}
            <div style={{ marginBottom: 12 }}><FieldLabel>CONTRACTS ({plan.contracts.length})</FieldLabel></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 26 }}>
              {contractGroups.map(g => {
                const gkey = `contract-${g.status}`
                const isCollapsed = collapsed.has(gkey)
                return (
                  <div key={g.status} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <GroupHeader label={CONTRACT_GROUP[g.status]} color={TONE[g.status].c} count={g.items.length} collapsed={isCollapsed} onToggle={() => toggleGroup(gkey)} />
                    {!isCollapsed && g.items.map(ct => (
                      <ContractCard key={ct.key} ct={ct} nameOf={nameOf} onToggle={() => toggleContract(ct.key)} onAction={a => setDupAction(ct.key, a)} />
                    ))}
                  </div>
                )
              })}
            </div>

            {/* CONTACTS second */}
            <div style={{ marginBottom: 12 }}><FieldLabel>CONTACTS ({plan.contacts.length})</FieldLabel></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {contactGroups.map(g => {
                const gkey = `contact-${g.status}`
                const isCollapsed = collapsed.has(gkey)
                // within a group, push the ones needing a decision to the end
                const items = [...g.items].sort((a, b) => Number(contactNeedsReview(a)) - Number(contactNeedsReview(b)))
                return (
                  <div key={g.status} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <GroupHeader label={CONTACT_GROUP[g.status]} color={TONE[g.status].c} count={g.items.length} collapsed={isCollapsed} onToggle={() => toggleGroup(gkey)} />
                    {!isCollapsed && items.map(c => (
                      <ContactCard
                        key={c.key} c={c} expanded={openReview.has(c.key)}
                        onToggleExpand={() => toggleExpand(c.key)}
                        onToggleInclude={() => toggleContact(c.key)}
                        onResolve={(f, v) => resolveConflict(c.key, f, v)}
                        onSubtype={v => setSubtype(c.key, v)}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {step === 'done' && result && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <CheckCircle2 size={22} color={GREEN} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Import complete</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{plan?.fileName}</div>
              </div>
            </div>
            {([
              ['Contracts imported', result.contractsImported, GREEN],
              ['Contracts skipped', result.contractsSkipped, 'var(--muted)'],
              ['Contacts created', result.contactsCreated, 'var(--foreground)'],
              ['Contacts merged', result.contactsMerged, 'var(--foreground)'],
              ['Contacts matched', result.contactsMatched, 'var(--muted)'],
              ['Rows with errors', result.errors, result.errors ? AMBER : 'var(--muted)'],
            ] as const).map(([label, value, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--body)' }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color }}>{value}</span>
              </div>
            ))}
            <button onClick={reset} style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
              <RotateCcw size={13} /> Import another file
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {step === 'upload' && (
          <button onClick={handleReview} disabled={!file || loading}
            style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer', background: !file ? 'var(--surface)' : GOLD, color: !file ? 'var(--muted)' : '#000', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Reading file…' : 'Review Import'}
          </button>
        )}
        {step === 'review' && (
          <>
            <button onClick={() => setStep('upload')} style={{ height: 44, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={15} /> Back
            </button>
            <button onClick={handleConfirm} disabled={contractsIncl.length === 0 || loading}
              style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: contractsIncl.length === 0 || loading ? 'not-allowed' : 'pointer', background: contractsIncl.length === 0 ? 'var(--surface)' : GOLD, color: contractsIncl.length === 0 ? 'var(--muted)' : '#000', fontSize: 13, fontWeight: 600 }}>
              {loading ? 'Importing…' : `Confirm Import${contractsIncl.length ? ` (${contractsIncl.length})` : ''}`}
            </button>
          </>
        )}
        {step === 'done' && (
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer', background: GOLD, color: '#000', fontSize: 13, fontWeight: 600 }}>
            Done
          </button>
        )}
      </div>
    </SlideOverPanel>
  )
}
