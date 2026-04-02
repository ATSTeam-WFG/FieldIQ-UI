'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Search, Plus, DollarSign } from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import { useContract } from '@/lib/context/ContractContext'
import { useRole } from '@/lib/context/RoleContext'
import { useAddContact } from '@/lib/context/AddContactContext'
import { useSuccessToast } from '@/components/fieldiq/SuccessToast'
import { useTheme } from '@/lib/context/ThemeContext'
import contactsData from '@/lib/mock-data/contacts.json'
import { DatePickerInput } from '@/components/fieldiq/DatePickerInput'
import { TimePickerInput } from '@/components/fieldiq/TimePickerInput'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Contact {
  id: string
  name: string
  initials: string
  company: string
  type?: string
}

type ContractStatus = 'initiated' | 'pending' | 'closed' | 'updated'

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'initiated', label: 'Initiated' },
  { value: 'pending',   label: 'Pending'   },
  { value: 'closed',    label: 'Closed'    },
  { value: 'updated',   label: 'Updated'   },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function LogContractPanel() {
  const { closeLog, editingContract } = useContract()
  const { role } = useRole()
  const isManager = role === 'manager'
  const isViewMode = isManager && editingContract !== null
  const isEditMode = !isManager && editingContract !== null
  const { openAddContact } = useAddContact()
  const showToast = useSuccessToast()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Form state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactSearch, setContactSearch] = useState('')
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<ContractStatus>('initiated')
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
      setTitle(editingContract.title)
      setAmount(editingContract.amount > 0 ? String(editingContract.amount) : '')
      setStatus(editingContract.status)
      setExpectedDate(editingContract.expectedClosingDate || editingContract.actualClosingDate || '')
      setNotes(editingContract.notes || '')
      // Pre-fill contact search with contact name
      setContactSearch(editingContract.contactName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingContract])

  const agentContacts = (contactsData as Contact[]).filter(c => c.type !== 'sponsor')
  const filteredContacts = contactSearch
    ? agentContacts.filter(
        c =>
          c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
          c.company.toLowerCase().includes(contactSearch.toLowerCase())
      )
    : agentContacts

  function handleSubmit() {
    if (!selectedContact || !title.trim()) return
    showToast('Contract logged successfully')
    closeLog()
  }

  const canSubmit = !!selectedContact && title.trim().length > 0

  // ── Shared input style ────────────────────────────────────────────────────

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
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SlideOverPanel onClose={closeLog} width={480}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col" style={{ padding: '20px 24px 14px 24px', gap: 4 }}>
          {/* Mobile drag handle */}
          <div className="flex justify-center md:hidden" style={{ marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--border)',
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--foreground)' }}>
                {isViewMode ? 'View Contract' : isEditMode ? 'Edit Contract' : 'Log Contract'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {isViewMode ? 'Contract details (read-only)' : isEditMode ? 'Edit this contract' : 'Record a new title closing deal'}
              </span>
            </div>
            <button
              onClick={closeLog}
              className="rounded-[6px] p-1 transition-colors hover:bg-[var(--surface)]"
            >
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

          {/* ── Select Contact ─────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Contact *</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setContactDropdownOpen(prev => !prev)}
                className="flex w-full items-center justify-between"
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  paddingLeft: 12,
                  paddingRight: 10,
                  textAlign: 'left',
                  height: 44,
                }}
              >
                {selectedContact ? (
                  <div className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full"
                      style={{
                        width: 26,
                        height: 26,
                        backgroundColor: '#c4a574',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#000',
                      }}
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
                  style={{
                    top: 48,
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    maxHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Search */}
                  <div
                    className="flex items-center"
                    style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', gap: 8 }}
                  >
                    <Search size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <input
                      autoFocus
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      placeholder="Search contacts…"
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontSize: 13,
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                    {/* Add new contact */}
                    <button
                      type="button"
                      className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                      style={{ height: 40, padding: '0 12px', gap: 8 }}
                      onClick={() => {
                        setContactDropdownOpen(false)
                        openAddContact()
                      }}
                    >
                      <div
                        className="flex shrink-0 items-center justify-center rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: 'var(--surface)',
                          border: '1px dashed var(--border)',
                        }}
                      >
                        <Plus size={12} style={{ color: 'var(--muted)' }} />
                      </div>
                      <span style={{ fontSize: 13, color: '#c4a574', fontWeight: 500 }}>
                        Add new contact
                      </span>
                    </button>

                    {filteredContacts.length === 0 ? (
                      <div
                        className="flex items-center justify-center"
                        style={{ height: 48, fontSize: 13, color: 'var(--muted)' }}
                      >
                        No contacts found
                      </div>
                    ) : (
                      filteredContacts.map(contact => (
                        <button
                          key={contact.id}
                          type="button"
                          className="flex w-full items-center transition-colors hover:bg-[var(--surface)]"
                          style={{ height: 44, padding: '0 12px', gap: 10 }}
                          onClick={() => {
                            setSelectedContact(contact)
                            setContactDropdownOpen(false)
                            setContactSearch('')
                          }}
                        >
                          <div
                            className="flex shrink-0 items-center justify-center rounded-full"
                            style={{
                              width: 28,
                              height: 28,
                              backgroundColor: '#c4a574',
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#000',
                            }}
                          >
                            {contact.initials}
                          </div>
                          <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
                            <span
                              className="truncate"
                              style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}
                            >
                              {contact.name}
                            </span>
                            <span
                              className="truncate"
                              style={{ fontSize: 11, color: 'var(--muted)' }}
                            >
                              {contact.company}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Contract Title ─────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Contract Title *</label>
            <input
              type="text"
              placeholder="e.g. 123 Maple St Closing"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ ...inputStyle, height: 44 }}
            />
          </div>

          {/* ── Amount + Status row ───────────────────────────────────── */}
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Amount */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Amount</label>
              <div style={{ position: 'relative' }}>
                <DollarSign
                  size={13}
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                  }}
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
              <div style={{ position: 'relative' }}>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ContractStatus)}
                  style={{
                    ...inputStyle,
                    paddingRight: 32,
                    appearance: 'none',
                    cursor: 'pointer',
                    height: 44,
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      style={{
                        backgroundColor: isDark ? '#171717' : '#ffffff',
                        color: 'var(--foreground)',
                      }}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Expected Closing Date + Time ─────────────────────────────────── */}
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
              style={{
                ...inputStyle,
                height: 'auto',
                paddingTop: 10,
                paddingBottom: 10,
                resize: 'none',
              }}
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
                  className="flex items-center justify-center rounded-[8px] font-semibold transition-opacity"
                  style={{ height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14, backgroundColor: '#c4a574', color: '#000000', border: 'none', cursor: 'pointer' }}
                >
                  Save Changes
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
                disabled={!canSubmit}
                className="flex items-center justify-center rounded-[8px] font-semibold transition-opacity"
                style={{
                  height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14,
                  backgroundColor: canSubmit ? '#c4a574' : 'var(--surface)',
                  color: canSubmit ? '#000000' : 'var(--muted)',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  border: 'none',
                }}
              >
                Log Contract
              </button>
            </>
          )}
        </div>
    </SlideOverPanel>
  )
}
