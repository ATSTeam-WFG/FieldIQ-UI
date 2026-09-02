'use client'

import { X, FileText } from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import type { Contract } from '@/lib/api/contracts'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number | null): string {
  if (n == null) return '—'
  return '$' + n.toLocaleString('en-US')
}

function formatDate(raw: string | null): string {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const STATUS_COLOR: Record<string, string> = {
  closed:    '#16a34a',
  cancelled: '#d97706',
  initiated: 'var(--muted)',
  pending:   'var(--muted)',
  updated:   'var(--muted)',
}

const STATUS_LABEL: Record<string, string> = {
  initiated: 'Opened',
  pending:   'Pending',
  updated:   'Updated',
  closed:    'Closed',
  cancelled: 'Cancelled',
}

// ── Field row ─────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--foreground)' }}>
        {value || '—'}
      </span>
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface Props {
  contract: Contract
  onClose: () => void
}

export function ContractDetailPanel({ contract, onClose }: Props) {
  const statusColor = STATUS_COLOR[contract.status] ?? 'var(--muted)'
  const statusLabel = STATUS_LABEL[contract.status] ?? capitalize(contract.status)
  const title = contract.title || contract.property_address || 'Untitled Contract'

  return (
    <SlideOverPanel onClose={onClose}>
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FileText size={16} style={{ color: '#c4a574' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
              color: statusColor, border: `1px solid ${statusColor}`,
              borderRadius: 4, padding: '1px 7px',
            }}>
              {statusLabel.toUpperCase()}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {capitalize(contract.transaction_type.replace('_', ' '))}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 30, height: 30, borderRadius: 6, border: 'none',
            backgroundColor: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Realtors */}
          {(contract.contact || contract.secondary_contact) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {contract.secondary_contact ? 'Realtors' : 'Realtor'}
              </span>
              {[contract.contact, contract.secondary_contact].filter(Boolean).map(rc => (
                <div key={rc!.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: 'var(--foreground)' }}>{rc!.name}</span>
                  {rc!.company && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {rc!.company}</span>
                  )}
                  {contract.referring_contact_id === rc!.id && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                      color: '#c4a574', border: '1px solid #c4a574',
                      borderRadius: 4, padding: '1px 6px',
                    }}>
                      BROUGHT THE BUSINESS
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Financing lender */}
          {contract.lender_contact && (
            <Field
              label="Financing Lender"
              value={
                contract.lender_contact.company
                  ? `${contract.lender_contact.name} · ${contract.lender_contact.company}`
                  : contract.lender_contact.name
              }
            />
          )}

          {/* Amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Purchase Price" value={formatCurrency(contract.amount)} />
            {contract.loan_amount != null && (
              <Field label="Loan Amount" value={formatCurrency(contract.loan_amount)} />
            )}
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Opening Date" value={formatDate(contract.opening_date)} />
            <Field label="Expected Closing" value={formatDate(contract.expected_closing_date)} />
            <Field label="Actual Closing" value={formatDate(contract.actual_closing_date)} />
          </div>

          {/* Address + City */}
          {contract.property_address && (
            <Field label="Property Address" value={contract.property_address} />
          )}
          {contract.city && (
            <Field label="City" value={contract.city} />
          )}

          {/* File number */}
          {contract.file_number && (
            <Field label="File Number" value={contract.file_number} />
          )}

          {/* Notes */}
          {contract.notes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Notes
              </span>
              <p style={{ fontSize: 14, color: 'var(--foreground)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {contract.notes}
              </p>
            </div>
          )}

        </div>
      </div>
    </SlideOverPanel>
  )
}
