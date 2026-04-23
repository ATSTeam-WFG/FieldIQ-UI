'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Search, Plus, DollarSign, Users } from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import { useContract } from '@/lib/context/ContractContext'
import { useRole } from '@/lib/context/RoleContext'
import { useAddContact } from '@/lib/context/AddContactContext'
import { useSuccessToast } from '@/components/fieldiq/SuccessToast'
import { useContacts } from '@/lib/hooks/useContacts'
import { useCreateContract } from '@/lib/hooks/useContracts'
import { DatePickerInput } from '@/components/fieldiq/DatePickerInput'
import { TimePickerInput } from '@/components/fieldiq/TimePickerInput'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Contact {
  id: string
  name: string
  initials: string
  company: string | null
  type?: string
}

type ContractStatus = 'opened' | 'closed' | 'cancelled'
type ContractType   = 'Regular' | 'Refinance' | 'Commercial'

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'opened',    label: 'Opened'    },
  { value: 'closed',    label: 'Closed'    },
  { value: 'cancelled', label: 'Cancelled' },
]

const TYPE_OPTIONS: ContractType[] = ['Regular', 'Refinance', 'Commercial']

// ── PanelSelect ───────────────────────────────────────────────────────────────
// Branded custom dropdown for form fields — matches FilterDropdown visual style.

function PanelSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center rounded-[8px] transition-colors"
        style={{
          height: 44,
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
          backgroundColor: 'var(--surface)',
          border: open ? '1px solid #c4a574' : '1px solid var(--border)',
        }}
      >
        <span className="flex-1 text-left" style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--muted)',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-30 overflow-hidden rounded-[8px]"
          style={{
            top: 50,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {options.map((opt, i) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                style={{
                  height: 44,
                  paddingLeft: 16,
                  paddingRight: 16,
                  gap: 10,
                  borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {active && (
                  <div style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#c4a574', flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#c4a574' : 'var(--body)',
                    marginLeft: active ? 0 : 13,
                  }}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LogContractPanel() {
  const { closeLog, editingContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'
  const isViewMode = isManager && editingContract !== null
  const isEditMode = !isManager && editingContract !== null
  const { openAddContactWithCallback } = useAddContact()
  const showToast = useSuccessToast()
  const { data: contactsData } = useContacts()
  const createContract = useCreateContract()

  // Form state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactSearch, setContactSearch] = useState('')
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false)
  const [fileNumber, setFileNumber] = useState('')
  const [address, setAddress] = useState('')
  const [contractType, setContractType] = useState<ContractType>('Regular')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<ContractStatus>('opened')
  const [expectedDate, setExpectedDate] = useState('')
  const [expectedTime, setExpectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setContactDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Pre-populate from editingContract
  useEffect(() => {
    if (editingContract) {
      setFileNumber(editingContract.fileNumber || '')
      setAddress(editingContract.address || '')
      setContractType(editingContract.type || 'Regular')
      setAmount(editingContract.amount > 0 ? String(editingContract.amount) : '')
      setStatus(editingContract.status)
      setExpectedDate(editingContract.expectedClosingDate || editingContract.actualClosingDate || '')
      setNotes(editingContract.notes || '')
      const match = (contactsData?.items ?? []).find(
        c => c.name === (editingContract as any).contactName
      ) as Contact | undefined ?? null
      setSelectedContact(match)
      setContactSearch('')
    } else {
      setSelectedContact(null)
      setContactSearch('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingContract])

  const repContacts = (contactsData?.items ?? []).filter(c => c.type !== 'vendor') as Contact[]
  const filteredContacts = contactSearch
    ? repContacts.filter(
        c =>
          c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
          (c.company ?? '').toLowerCase().includes(contactSearch.toLowerCase())
      )
    : repContacts

  const TYPE_MAP: Record<ContractType, string> = {
    Regular: 'purchase',
    Refinance: 'refinance',
    Commercial: 'commercial',
  }
  const STATUS_MAP: Record<ContractStatus, string> = {
    opened: 'initiated',
    closed: 'closed',
    cancelled: 'cancelled',
  }

  async function handleSubmit() {
    if (!selectedContact || !address.trim()) return
    try {
      await createContract.mutateAsync({
        contact_id: selectedContact.id,
        property_address: address,
        transaction_type: TYPE_MAP[contractType],
        status: STATUS_MAP[status],
        file_number: fileNumber || null,
        amount: amount ? parseFloat(amount) : null,
        expected_closing_date: expectedDate || null,
        notes: notes || null,
      })
      showToast('Contract logged successfully')
      closeLog()
    } catch {}
  }

  const canSubmit = !!selectedContact && address.trim().length > 0

  // ── Shared styles ─────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 13,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--foreground)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--muted)',
    marginBottom: 6,
    display: 'block',
    letterSpacing: '0.04em',
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SlideOverPanel onClose={closeLog} width={480}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col" style={{ padding: '20px 24px 14px 24px', gap: 4 }}>
          <div className="flex justify-center md:hidden" style={{ marginBottom: 8 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--foreground)' }}>
                {isViewMode ? 'View Contract' : isEditMode ? 'Edit Contract' : 'Add Contract'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {isViewMode ? 'Contract details (read-only)' : isEditMode ? 'Edit this contract' : 'Record a new title closing deal'}
              </span>
            </div>
            <button onClick={closeLog} className="rounded-[6px] p-1 transition-colors hover:bg-[var(--surface)]">
              <X size={20} style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />

        {/* ── Scrollable content ───────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, ...(isViewMode ? { pointerEvents: 'none', opacity: 0.75 } : {}) }}
        >

          {/* ── Contact ──────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Contact *</label>
            {repContacts.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-[8px]"
                style={{ padding: '20px 16px', gap: 10, textAlign: 'center', border: '1px dashed var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <Users size={20} style={{ color: 'var(--muted)' }} />
                <div className="flex flex-col" style={{ gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>No contacts yet</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Add your first contact to link it to this contract.</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAddContactWithCallback((newContact) => {
                    setSelectedContact({
                      id: newContact.id,
                      name: newContact.name,
                      initials: newContact.initials,
                      company: newContact.company,
                      type: newContact.type,
                    })
                  })}
                  className="flex items-center gap-2 rounded-[8px] transition-opacity hover:opacity-80"
                  style={{ height: 36, padding: '0 16px', fontSize: 13, fontWeight: 600, backgroundColor: '#c4a574', color: '#000000', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={13} />
                  Add your first contact
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setContactDropdownOpen(prev => !prev)}
                  className="flex w-full items-center justify-between"
                  style={{ ...inputStyle, cursor: 'pointer', paddingLeft: 12, paddingRight: 10, textAlign: 'left', height: 44 }}
                >
                  {selectedContact ? (
                    <div className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
                      <div
                        className="flex shrink-0 items-center justify-center rounded-full"
                        style={{ width: 26, height: 26, backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#000' }}
                      >
                        {selectedContact.initials}
                      </div>
                      <div className="flex min-w-0 flex-col" style={{ gap: 1 }}>
                        <span className="truncate" style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>
                          {selectedContact.name}
                        </span>
                        <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {selectedContact.company}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Select a contact…</span>
                  )}
                  <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                </button>

                {contactDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 z-10 overflow-hidden rounded-[8px]"
                    style={{ top: 48, backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', maxHeight: 260, display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="flex items-center" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', gap: 8 }}>
                      <Search size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                      <input
                        autoFocus
                        value={contactSearch}
                        onChange={e => setContactSearch(e.target.value)}
                        placeholder="Search contacts…"
                        style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 13, color: 'var(--foreground)' }}
                      />
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                      <button
                        type="button"
                        className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                        style={{ height: 40, padding: '0 12px', gap: 8 }}
                        onClick={() => {
                          setContactDropdownOpen(false)
                          openAddContactWithCallback((newContact) => {
                            setSelectedContact({
                              id: newContact.id,
                              name: newContact.name,
                              initials: newContact.initials,
                              company: newContact.company,
                              type: newContact.type,
                            })
                          })
                        }}
                      >
                        <div
                          className="flex shrink-0 items-center justify-center rounded-full"
                          style={{ width: 24, height: 24, backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
                        >
                          <Plus size={12} style={{ color: 'var(--muted)' }} />
                        </div>
                        <span style={{ fontSize: 13, color: '#c4a574', fontWeight: 500 }}>Add new contact</span>
                      </button>
                      {filteredContacts.length === 0 ? (
                        <div className="flex items-center justify-center" style={{ height: 48, fontSize: 13, color: 'var(--muted)' }}>
                          No contacts found
                        </div>
                      ) : (
                        filteredContacts.map(contact => (
                          <button
                            key={contact.id}
                            type="button"
                            className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                            style={{ height: 44, padding: '0 12px', gap: 10 }}
                            onClick={() => { setSelectedContact(contact); setContactDropdownOpen(false); setContactSearch('') }}
                          >
                            <div
                              className="flex shrink-0 items-center justify-center rounded-full"
                              style={{ width: 28, height: 28, backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#000' }}
                            >
                              {contact.initials}
                            </div>
                            <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
                              <span className="truncate" style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{contact.name}</span>
                              <span className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>{contact.company}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── File Number ───────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>File Number / GF Number *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="e.g. 202603150001"
              value={fileNumber}
              onChange={e => setFileNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
              style={{ ...inputStyle, height: 44, fontFamily: 'monospace', letterSpacing: '0.06em' }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
              {fileNumber.length}/12 digits
            </span>
          </div>

          {/* ── Address ───────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Address *</label>
            <input
              type="text"
              placeholder="e.g. 123 Peachtree Rd NE, Atlanta, GA 30309"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ ...inputStyle, height: 44 }}
            />
          </div>

          {/* ── Type ─────────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Type</label>
            <div
              className="flex overflow-hidden rounded-[8px]"
              style={{ border: '1px solid var(--border)', height: 44 }}
            >
              {TYPE_OPTIONS.map((opt, i) => {
                const active = contractType === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setContractType(opt)}
                    className="flex flex-1 items-center justify-center transition-colors"
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      backgroundColor: active ? '#c4a574' : 'var(--surface)',
                      color: active ? '#000000' : 'var(--muted)',
                      borderRight: i < TYPE_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Amount + Status ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Amount */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Amount</label>
              <div style={{ position: 'relative' }}>
                <DollarSign
                  size={13}
                  style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 28, height: 44 }}
                />
              </div>
            </div>

            {/* Status */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Status</label>
              <PanelSelect options={STATUS_OPTIONS} value={status} onChange={setStatus} />
            </div>
          </div>

          {/* ── Expected Closing Date + Time ──────────────────────────── */}
          <div className="flex flex-col" style={{ gap: 16 }}>
            <div>
              <label style={labelStyle}>Expected Closing Date</label>
              <div style={{ marginTop: 6 }}>
                <DatePickerInput value={expectedDate} onChange={setExpectedDate} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Expected Closing Time</label>
              <div style={{ marginTop: 6 }}>
                <TimePickerInput value={expectedTime} onChange={setExpectedTime} />
              </div>
            </div>
          </div>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              placeholder="Any notes about this contract…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{ ...inputStyle, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
            />
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />
        <div
          className="flex shrink-0 items-center"
          style={{ padding: '16px 24px', gap: 10, justifyContent: isEditMode ? 'space-between' : 'flex-end' }}
        >
          {isViewMode && (
            <button
              onClick={closeLog}
              className="flex items-center justify-center rounded-[8px] font-medium transition-colors hover:bg-[var(--surface)]"
              style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, border: '1px solid var(--border)', color: 'var(--body)', backgroundColor: 'transparent' }}
            >
              Close
            </button>
          )}
          {isEditMode && (
            <>
              <button
                onClick={() => { showToast('Contract deleted'); closeLog() }}
                style={{ height: 40, padding: '0 16px', fontSize: 14, fontWeight: 500, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
              >
                Delete Contract
              </button>
              <div className="flex items-center" style={{ gap: 10 }}>
                <button
                  onClick={closeLog}
                  className="flex items-center justify-center rounded-[8px] font-medium transition-colors hover:bg-[var(--surface)]"
                  style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, border: '1px solid var(--border)', color: 'var(--body)', backgroundColor: 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createContract.isPending}
                  className="flex items-center justify-center rounded-[8px] font-semibold transition-opacity"
                  style={{ height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14, backgroundColor: '#c4a574', color: '#000000', border: 'none', cursor: createContract.isPending ? 'not-allowed' : 'pointer', opacity: createContract.isPending ? 0.6 : 1 }}
                >
                  {createContract.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
          {!isViewMode && !isEditMode && (
            <>
              <button
                onClick={closeLog}
                className="flex items-center justify-center rounded-[8px] font-medium transition-colors hover:bg-[var(--surface)]"
                style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, border: '1px solid var(--border)', color: 'var(--body)', backgroundColor: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || createContract.isPending}
                className="flex items-center justify-center rounded-[8px] font-semibold transition-opacity"
                style={{
                  height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14,
                  backgroundColor: canSubmit ? '#c4a574' : 'var(--surface)',
                  color: canSubmit ? '#000000' : 'var(--muted)',
                  cursor: (canSubmit && !createContract.isPending) ? 'pointer' : 'not-allowed',
                  border: 'none',
                  opacity: createContract.isPending ? 0.6 : 1,
                }}
              >
                {createContract.isPending ? 'Saving…' : 'Add Contract'}
              </button>
            </>
          )}
        </div>
    </SlideOverPanel>
  )
}
