'use client'

import { useState, useEffect } from 'react'
import { X, Users, Building2 } from 'lucide-react'
import { useAddContact } from '@/lib/context/AddContactContext'
import { useSuccessToast } from '@/components/fieldiq/SuccessToast'
import { useTheme } from '@/lib/context/ThemeContext'
import { SlideOverPanel } from './SlideOverPanel'

// ── Constants ─────────────────────────────────────────────────────────────────

const AGENT_TAGS = [
  'high-value', 'residential', 'commercial', 'luxury', 'referral-source',
  'loyal', 'new-contact', 'growth', 'team-lead', 'social-media-active',
  'multi-listing', 'out-of-state-buyers',
]

const VENDOR_TAGS = [
  'vendor', 'mortgage', 'home-warranty', 'inspection',
]

const AGENT_TYPE_OPTIONS: ('Buyer' | 'Seller' | 'Realtor')[] = ['Buyer', 'Seller', 'Realtor']

// ── FieldLabel helper ─────────────────────────────────────────────────────────

function FieldLabel({ label, required, optional }: { label: string; required?: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--muted)',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </span>
      {required && (
        <span style={{ color: '#c4a574', fontSize: 13, lineHeight: 1 }}>*</span>
      )}
      {optional && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--muted)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '1px 6px',
            letterSpacing: '0.04em',
          }}
        >
          Optional
        </span>
      )}
    </div>
  )
}

// ── Input styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--foreground)',
  fontSize: 14,
  outline: 'none',
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AddContactPanel() {
  const { isOpen, closeAddContact, editingContact } = useAddContact()
  const isEditMode = editingContact !== null
  const showToast = useSuccessToast()
  const { theme } = useTheme()

  // Form state
  const [contactType, setContactType] = useState<'agent' | 'vendor'>('agent')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [agentType, setAgentType] = useState<'Buyer' | 'Seller' | 'Realtor'>('Realtor')
  const [industry, setIndustry] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const availableTags = contactType === 'agent' ? AGENT_TAGS : VENDOR_TAGS

  // Pre-populate when editing
  useEffect(() => {
    if (editingContact) {
      setContactType(editingContact.type === 'vendor' ? 'vendor' : 'agent')
      setName(editingContact.name)
      setCompany(editingContact.company)
      setRole(editingContact.role || '')
      setEmail(editingContact.email || '')
      setPhone(editingContact.phone || '')
      setSelectedTags(editingContact.tags || [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingContact])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAddContact()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeAddContact])

  function handleTypeChange(type: 'agent' | 'vendor') {
    setContactType(type)
    setSelectedTags([])
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function resetForm() {
    setContactType('agent')
    setName('')
    setCompany('')
    setAgentType('Realtor')
    setIndustry('')
    setRole('')
    setEmail('')
    setPhone('')
    setSelectedTags([])
    setNotes('')
  }

  function handleSave() {
    showToast(isEditMode ? 'Contact updated successfully' : 'Contact added successfully')
    closeAddContact()
    resetForm()
  }

  function handleCancel() {
    closeAddContact()
    resetForm()
  }

  const activeTileBg = theme === 'dark' ? '#1f1a12' : '#fdf8f0'

  return (
    <SlideOverPanel onClose={closeAddContact} width={560}>
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            {isEditMode ? 'Edit Contact' : 'Add Contact'}
          </span>
          <button
            onClick={handleCancel}
            className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
            style={{ width: 32, height: 32, color: 'var(--muted)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>

          {/* Section 1 — Contact Type */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Contact Type" />
            <div className="grid grid-cols-2 gap-2">
              {(['agent', 'vendor'] as const).map(type => {
                const active = contactType === type
                const Icon = type === 'agent' ? Users : Building2
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className="flex items-center gap-2 rounded-[8px] transition-colors"
                    style={{
                      height: 48,
                      padding: '0 16px',
                      border: active ? '2px solid #c4a574' : '1px solid var(--border)',
                      backgroundColor: active ? activeTileBg : 'var(--surface)',
                      cursor: 'pointer',
                      color: active ? '#c4a574' : 'var(--muted)',
                      fontWeight: active ? 600 : 400,
                      fontSize: 14,
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ textTransform: 'capitalize' as const }}>{type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2 — Full Name */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Full Name" required />
            <input
              type="text"
              placeholder="e.g. Marcus Webb"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Section 3 — Company */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Company" />
            <input
              type="text"
              placeholder="e.g. Peachtree Realty Group"
              value={company}
              onChange={e => setCompany(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Section 4a — Agent Type (agents only) */}
          {contactType === 'agent' && (
            <div style={{ marginBottom: 20 }}>
              <FieldLabel label="Agent Type" />
              <div
                className="flex overflow-hidden rounded-[8px]"
                style={{ border: '1px solid var(--border)', height: 44 }}
              >
                {AGENT_TYPE_OPTIONS.map((opt, i) => {
                  const active = agentType === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAgentType(opt)}
                      className="flex flex-1 items-center justify-center transition-colors"
                      style={{
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        backgroundColor: active ? '#c4a574' : 'var(--surface)',
                        color: active ? '#000000' : 'var(--muted)',
                        borderRight: i < AGENT_TYPE_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section 4b — Industry (vendors only) */}
          {contactType === 'vendor' && (
            <div style={{ marginBottom: 20 }}>
              <FieldLabel label="Industry" />
              <input
                type="text"
                placeholder="e.g. Mortgage, Home Warranty, Inspection"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* Section 5 — Role / Title */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Role / Title" />
            <input
              type="text"
              placeholder="e.g. Senior Broker"
              value={role}
              onChange={e => setRole(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Section 6 — Contact Details */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Email" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Phone" />
            <input
              type="tel"
              placeholder="(404) 555-0100"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Section 7 — Tags */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Tags" />
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const selected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: selected ? 600 : 400,
                      border: selected ? '1.5px solid #c4a574' : '1px solid var(--border)',
                      backgroundColor: selected ? activeTileBg : 'var(--surface)',
                      color: selected ? '#c4a574' : 'var(--muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 8 — Notes */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Notes" optional />
            <div className="relative">
              <textarea
                placeholder="Add any notes about this contact..."
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 500))}
                style={{
                  width: '100%',
                  height: 88,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  fontSize: 11,
                  color: 'var(--muted)',
                }}
              >
                {notes.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center justify-end gap-3"
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--muted)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
              color: theme === 'dark' ? '#000000' : '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isEditMode ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
    </SlideOverPanel>
  )
}
