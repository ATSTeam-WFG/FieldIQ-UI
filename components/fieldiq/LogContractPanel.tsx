'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Search, Plus, DollarSign, Users, Pencil, Trash2 } from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import { FieldLabel } from './FieldLabel'
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
          height: 40,
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
            top: 46,
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
  const { isOpen, closeLog, editingContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'
  const [isEditing, setIsEditing] = useState(false)
  const isViewMode = editingContract !== null && !isEditing
  const isEditMode = editingContract !== null && isEditing && !isManager
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

  // Reset editing state when panel closes
  useEffect(() => {
    if (!isOpen) setIsEditing(false)
  }, [isOpen])

  // Pre-populate from editingContract
  // Handles both ContractRecord (camelCase) and API Contract (snake_case) shapes
  useEffect(() => {
    if (editingContract) {
      const rec = editingContract as any

      setFileNumber(rec.fileNumber ?? rec.file_number ?? '')
      setAddress(rec.address ?? rec.property_address ?? '')

      const rawType = rec.type ?? rec.transaction_type ?? 'Regular'
      const REVERSE_TYPE: Record<string, ContractType> = {
        purchase: 'Regular', refinance: 'Refinance', commercial: 'Commercial',
        Regular: 'Regular', Refinance: 'Refinance', Commercial: 'Commercial',
      }
      setContractType(REVERSE_TYPE[rawType] ?? 'Regular')

      setAmount((rec.amount ?? 0) > 0 ? String(rec.amount) : '')

      const rawStatus = rec.status ?? 'opened'
      const REVERSE_STATUS: Record<string, ContractStatus> = {
        initiated: 'opened', opened: 'opened', closed: 'closed', cancelled: 'cancelled',
      }
      setStatus(REVERSE_STATUS[rawStatus] ?? 'opened')

      setExpectedDate(
        rec.expectedClosingDate ?? rec.expected_closing_date ??
        rec.actualClosingDate  ?? rec.actual_closing_date  ?? ''
      )
      setNotes(rec.notes ?? '')

      const contactName = rec.contactName ?? rec.contact?.name ?? ''
      const match = (contactsData?.items ?? []).find(
        c => c.name === contactName
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
    Regular:    'purchase',
    Refinance:  'refinance',
    Commercial: 'commercial',
  }
  const STATUS_MAP: Record<ContractStatus, string> = {
    opened:    'initiated',
    closed:    'closed',
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SlideOverPanel onClose={closeLog} width={560}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex shrink-0 flex-col" style={{ padding: '24px 28px 16px 28px', gap: 4 }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--foreground)' }}>
            {isViewMode ? 'View Contract' : isEditMode ? 'Edit Contract' : 'Add Contract'}
          </span>
          <div className="flex items-center gap-2">
            {isViewMode && !isManager && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-[6px] p-1 transition-colors hover:bg-[var(--surface)]"
                aria-label="Edit contract"
              >
                <Pencil size={20} style={{ color: 'var(--muted)' }} />
              </button>
            )}
            <button onClick={closeLog} className="rounded-[6px] p-1 transition-colors hover:bg-[var(--surface)]">
              <X size={20} style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          {isViewMode ? 'Contract details' : isEditMode ? 'Edit the details for this contract' : 'Record a new title closing deal'}
        </span>
      </div>
      <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, ...(isViewMode ? { pointerEvents: 'none', opacity: 0.75 } : {}) }}>

        {/* ── CONTACT ──────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>CONTACT *</FieldLabel>
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
                className="flex w-full items-center justify-between rounded-[8px]"
                style={{
                  padding: selectedContact ? '8px 12px' : '0 12px',
                  minHeight: 40,
                  gap: 8,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {selectedContact ? (
                  <div className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full"
                      style={{ width: 24, height: 24, backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#000' }}
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
                  style={{ top: 46, backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', maxHeight: 260, display: 'flex', flexDirection: 'column' }}
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
                      <span style={{ fontSize: 13, color: '#c4a574', fontWeight: 500 }}>+ Add new contact</span>
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

        {/* ── FILE NUMBER ───────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>FILE NUMBER / GF NUMBER</FieldLabel>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="e.g. 202603150001"
            value={fileNumber}
            onChange={e => setFileNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
            style={{
              height: 40,
              padding: '0 12px',
              fontSize: 13,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fileNumber.length}/12 digits</span>
        </div>

        {/* ── ADDRESS ───────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>ADDRESS *</FieldLabel>
          <input
            type="text"
            placeholder="e.g. 123 Peachtree Rd NE, Atlanta, GA 30309"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
            style={{
              height: 40,
              padding: '0 12px',
              fontSize: 13,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* ── TYPE ─────────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>TYPE</FieldLabel>
          <div
            className="flex overflow-hidden rounded-[8px]"
            style={{ border: '1px solid var(--border)', height: 40 }}
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

        {/* ── AMOUNT + STATUS ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>AMOUNT</FieldLabel>
            <div
              className="flex items-center rounded-[8px]"
              style={{ height: 40, padding: '0 12px', gap: 4, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <DollarSign size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                type="number"
                min="0"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>STATUS</FieldLabel>
            <PanelSelect options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>
        </div>

        {/* ── EXPECTED CLOSING DATE + TIME ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>EXPECTED CLOSING DATE</FieldLabel>
            <DatePickerInput value={expectedDate} onChange={setExpectedDate} />
          </div>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>EXPECTED CLOSING TIME</FieldLabel>
            <TimePickerInput value={expectedTime} onChange={setExpectedTime} />
          </div>
        </div>

        {/* ── NOTES ─────────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>NOTES <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></FieldLabel>
          <div
            className="flex flex-col rounded-[8px]"
            style={{ height: 88, padding: 12, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <textarea
              placeholder="Any notes about this contract…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="flex-1 resize-none bg-transparent outline-none"
              style={{ fontSize: 14, color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />
      <div
        className="flex shrink-0 items-center"
        style={{ height: 72, padding: '0 28px', justifyContent: isEditMode ? 'space-between' : 'flex-end' }}
      >
        {isEditMode && (
          <>
            <button
              onClick={() => { showToast('Contract deleted'); closeLog() }}
              className="flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--surface)]"
              style={{ color: 'var(--muted)', flexShrink: 0 }}
              aria-label="Delete contract"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleSubmit}
              disabled={createContract.isPending}
              className="rounded-[8px] font-medium transition-opacity hover:opacity-90"
              style={{
                height: 40,
                padding: '0 32px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: '#c4a574',
                color: '#000000',
                border: 'none',
                cursor: createContract.isPending ? 'not-allowed' : 'pointer',
                opacity: createContract.isPending ? 0.6 : 1,
              }}
            >
              {createContract.isPending ? 'Saving…' : 'Save'}
            </button>
          </>
        )}
        {!isViewMode && !isEditMode && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || createContract.isPending}
            className="rounded-[8px] font-medium transition-opacity hover:opacity-90"
            style={{
              height: 40,
              padding: '0 32px',
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: canSubmit ? '#c4a574' : 'var(--surface)',
              color: canSubmit ? '#000000' : 'var(--muted)',
              border: 'none',
              cursor: (canSubmit && !createContract.isPending) ? 'pointer' : 'not-allowed',
              opacity: createContract.isPending ? 0.6 : 1,
            }}
          >
            {createContract.isPending ? 'Saving…' : 'Add Contract'}
          </button>
        )}
      </div>
    </SlideOverPanel>
  )
}
