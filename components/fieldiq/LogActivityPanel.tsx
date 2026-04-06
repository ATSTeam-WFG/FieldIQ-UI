'use client'

import { useState, useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { SlideOverPanel } from './SlideOverPanel'
import {
  X, Utensils, Hand, GraduationCap, Coffee, Gift, Phone,
  Plus, ChevronDown, Upload, Mic, Sparkles, Check,
} from 'lucide-react'
import { useActivityLog } from '@/lib/context/ActivityLogContext'
import { useRole } from '@/lib/context/RoleContext'
import { useSuccessToast } from '@/components/fieldiq/SuccessToast'
import { useTheme } from '@/lib/context/ThemeContext'
import { toast } from '@/lib/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import contactsData from '@/lib/mock-data/contacts.json'
import { DatePickerInput } from '@/components/fieldiq/DatePickerInput'
import { TimePickerInput } from '@/components/fieldiq/TimePickerInput'

// ── Types ────────────────────────────────────────────────────────────────────

interface ActivityTileType {
  label: string
  icon: LucideIcon
}

interface Contact {
  id: string
  name: string
  initials: string
  company: string
  type?: string
  role?: string
}

interface VendorEntry {
  contact: Contact
  coverage: 'Full' | 'Partial'
  amount: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const activityTiles: ActivityTileType[] = [
  { label: 'Lunch',        icon: Utensils },
  { label: 'Pop-by',       icon: Hand },
  { label: 'CE Class',     icon: GraduationCap },
  { label: 'Coffee',       icon: Coffee },
  { label: 'Closing Gift', icon: Gift },
  { label: 'Call',         icon: Phone },
  { label: 'Other',        icon: Plus },
]

const durationOptions = ['30m', '1h', '1h 30m', '2h', '2h 30m', '3h', 'Other']

const OCCASION_OPTIONS = ['Regular Visit', 'Birthday', 'Holiday', 'New Listing', 'Other']
const CALL_OUTCOME_OPTIONS = [
  'Discussed follow-up',
  'Left voicemail',
  'No answer',
  'Discussed contract',
  'Other',
]

// ── SegmentedPill ─────────────────────────────────────────────────────────────

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      className="flex rounded-[8px] overflow-hidden"
      style={{ border: '1px solid var(--border)', height: 32 }}
    >
      {options.map((opt, i) => {
        const isSelected = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="flex flex-1 items-center justify-center transition-colors"
            style={{
              fontSize: 13, fontWeight: isSelected ? 600 : 400,
              backgroundColor: isSelected ? '#c4a574' : 'var(--surface)',
              color: isSelected ? '#000000' : 'var(--muted)',
              borderRight: i < options.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ── Activity-specific sub-components ─────────────────────────────────────────

function VenueLine({
  venue,
  setVenue,
}: {
  venue: string
  setVenue: (v: string) => void
}) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <FieldLabel>VENUE</FieldLabel>
      <input
        value={venue}
        onChange={e => setVenue(e.target.value)}
        placeholder="Restaurant or location name"
        className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
        style={{
          height: 40, padding: '0 12px', fontSize: 14,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}

const vendorContacts = (contactsData as Contact[]).filter(c => c.type === 'vendor')

function SponsorSection({
  isSponsored,
  setIsSponsored,
  vendorEntries,
  setVendorEntries,
}: {
  isSponsored: boolean
  setIsSponsored: (v: boolean) => void
  vendorEntries: VendorEntry[]
  setVendorEntries: (v: VendorEntry[]) => void
}) {
  const [vendorSearch, setVendorSearch] = useState('')
  const [showDrop, setShowDrop] = useState(false)

  const addedIds = new Set(vendorEntries.map(e => e.contact.id))
  const filtered = vendorContacts.filter(c =>
    !addedIds.has(c.id) &&
    (c.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
     c.company.toLowerCase().includes(vendorSearch.toLowerCase()))
  )

  function addVendor(c: Contact) {
    setVendorEntries([...vendorEntries, { contact: c, coverage: 'Full', amount: '' }])
    setVendorSearch('')
    setShowDrop(false)
  }

  function removeVendor(id: string) {
    setVendorEntries(vendorEntries.filter(e => e.contact.id !== id))
  }

  function updateEntry(id: string, patch: Partial<Omit<VendorEntry, 'contact'>>) {
    setVendorEntries(vendorEntries.map(e => e.contact.id === id ? { ...e, ...patch } : e))
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>Sponsored?</span>
        <button
          type="button"
          onClick={() => setIsSponsored(!isSponsored)}
          className="shrink-0 rounded-full transition-colors"
          style={{
            width: 40, height: 22, padding: 2,
            backgroundColor: isSponsored ? '#c4a574' : 'var(--border)',
            display: 'flex', alignItems: 'center',
            justifyContent: isSponsored ? 'flex-end' : 'flex-start',
          }}
          aria-label="Toggle sponsor"
        >
          <div className="rounded-full bg-white" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {isSponsored && (
        <div className="flex flex-col" style={{ gap: 10 }}>
          {/* Added vendor entries */}
          {vendorEntries.map(entry => (
            <div
              key={entry.contact.id}
              className="flex flex-col rounded-[8px]"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '10px 12px', gap: 8 }}
            >
              {/* Vendor header */}
              <div className="flex items-center" style={{ gap: 8 }}>
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#ffffff' }}
                >
                  {entry.contact.initials}
                </div>
                <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{entry.contact.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{entry.contact.company}</span>
                </div>
                <button type="button" onClick={() => removeVendor(entry.contact.id)} className="shrink-0">
                  <X size={14} style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              {/* Coverage pill */}
              <div className="flex flex-col" style={{ gap: 6 }}>
                <FieldLabel>COVERAGE</FieldLabel>
                <SegmentedPill<'Full' | 'Partial'>
                  options={['Full', 'Partial']}
                  value={entry.coverage}
                  onChange={v => updateEntry(entry.contact.id, { coverage: v })}
                />
              </div>

              {/* Amount — only for Partial */}
              {entry.coverage === 'Partial' && (
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <FieldLabel>AMOUNT ($)</FieldLabel>
                  <div
                    className="flex items-center rounded-[8px]"
                    style={{ height: 40, padding: '0 12px', gap: 4, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>$</span>
                    <input
                      type="number"
                      min="0"
                      value={entry.amount}
                      onChange={e => updateEntry(entry.contact.id, { amount: e.target.value })}
                      placeholder="0"
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: 14, color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Vendor search — always show while sponsored is on */}
          <div className="relative">
            <input
              value={vendorSearch}
              onChange={e => { setVendorSearch(e.target.value); setShowDrop(true) }}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              placeholder={vendorEntries.length > 0 ? 'Add another vendor…' : 'Search vendors…'}
              className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
              style={{
                height: 40, padding: '0 12px', fontSize: 14,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
            {showDrop && filtered.length > 0 && (
              <div
                className="absolute left-0 right-0 top-[44px] z-10 overflow-hidden rounded-[8px]"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                {filtered.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => addVendor(c)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--surface)]"
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#ffffff' }}
                    >
                      {c.initials}
                    </div>
                    <div className="flex flex-col items-start" style={{ gap: 1 }}>
                      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.company}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PopByFields({
  leaveBehind,
  setLeaveBehind,
  occasion,
  setOccasion,
}: {
  leaveBehind: string
  setLeaveBehind: (v: string) => void
  occasion: string
  setOccasion: (v: string) => void
}) {
  return (
    <>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <FieldLabel>LEAVE-BEHIND ITEM</FieldLabel>
          <span
            className="rounded-[4px]"
            style={{ fontSize: 10, padding: '2px 6px', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Optional
          </span>
        </div>
        <input
          value={leaveBehind}
          onChange={e => setLeaveBehind(e.target.value)}
          placeholder="e.g. Branded notepad, closing gift bag"
          className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
          style={{
            height: 40, padding: '0 12px', fontSize: 14,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <FieldLabel>OCCASION</FieldLabel>
        <div
          className="flex items-center justify-between rounded-[8px] cursor-pointer"
          style={{
            height: 40, padding: '0 12px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <select
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
            className="flex-1 bg-transparent outline-none appearance-none cursor-pointer"
            style={{ fontSize: 14, color: 'var(--foreground)' }}
          >
            {OCCASION_OPTIONS.map(opt => (
              <option key={opt} value={opt} style={{ backgroundColor: 'var(--card)' }}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0, pointerEvents: 'none' }} />
        </div>
      </div>
    </>
  )
}

function CeClassFields({
  classTopic, setClassTopic,
  ceCredits, setCeCredits,
  attendees, setAttendees,
  venue, setVenue,
  isSponsored, setIsSponsored,
  vendorEntries, setVendorEntries,
}: {
  classTopic: string; setClassTopic: (v: string) => void
  ceCredits: string; setCeCredits: (v: string) => void
  attendees: string; setAttendees: (v: string) => void
  venue: string; setVenue: (v: string) => void
  isSponsored: boolean; setIsSponsored: (v: boolean) => void
  vendorEntries: VendorEntry[]; setVendorEntries: (v: VendorEntry[]) => void
}) {
  return (
    <>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <FieldLabel>CLASS TOPIC</FieldLabel>
        <input
          value={classTopic}
          onChange={e => setClassTopic(e.target.value)}
          placeholder="e.g. Closing Process Overview"
          className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
          style={{
            height: 40, padding: '0 12px', fontSize: 14,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 8 }}>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>CE CREDITS</FieldLabel>
          <input
            type="number"
            min="0"
            value={ceCredits}
            onChange={e => setCeCredits(e.target.value)}
            placeholder="e.g. 2"
            className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
            style={{
              height: 40, padding: '0 12px', fontSize: 14,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <FieldLabel>ATTENDEES</FieldLabel>
          <input
            type="number"
            min="0"
            value={attendees}
            onChange={e => setAttendees(e.target.value)}
            placeholder="e.g. 12"
            className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
            style={{
              height: 40, padding: '0 12px', fontSize: 14,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </div>
      <VenueLine venue={venue} setVenue={setVenue} />
      <SponsorSection
        isSponsored={isSponsored} setIsSponsored={setIsSponsored}
        vendorEntries={vendorEntries} setVendorEntries={setVendorEntries}
      />
    </>
  )
}

function ClosingGiftFields({
  giftItem, setGiftItem,
  dealRef, setDealRef,
  isSponsored, setIsSponsored,
  vendorEntries, setVendorEntries,
}: {
  giftItem: string; setGiftItem: (v: string) => void
  dealRef: string; setDealRef: (v: string) => void
  isSponsored: boolean; setIsSponsored: (v: boolean) => void
  vendorEntries: VendorEntry[]; setVendorEntries: (v: VendorEntry[]) => void
}) {
  return (
    <>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <FieldLabel>GIFT ITEM / DESCRIPTION</FieldLabel>
        <input
          value={giftItem}
          onChange={e => setGiftItem(e.target.value)}
          placeholder="e.g. Wine gift set, custom cutting board"
          className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
          style={{
            height: 40, padding: '0 12px', fontSize: 14,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <FieldLabel>DEAL REFERENCE</FieldLabel>
          <span
            className="rounded-[4px]"
            style={{ fontSize: 10, padding: '2px 6px', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Optional
          </span>
        </div>
        <input
          value={dealRef}
          onChange={e => setDealRef(e.target.value)}
          placeholder="e.g. 123 Maple St closing"
          className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
          style={{
            height: 40, padding: '0 12px', fontSize: 14,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>
      <SponsorSection
        isSponsored={isSponsored} setIsSponsored={setIsSponsored}
        vendorEntries={vendorEntries} setVendorEntries={setVendorEntries}
      />
    </>
  )
}

function CallFields({
  callType, setCallType,
  callOutcome, setCallOutcome,
}: {
  callType: 'Phone' | 'Video' | 'In-Person'
  setCallType: (v: 'Phone' | 'Video' | 'In-Person') => void
  callOutcome: string
  setCallOutcome: (v: string) => void
}) {
  return (
    <>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <FieldLabel>CALL TYPE</FieldLabel>
        <SegmentedPill<'Phone' | 'Video' | 'In-Person'>
          options={['Phone', 'Video', 'In-Person']}
          value={callType}
          onChange={setCallType}
        />
      </div>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <FieldLabel>OUTCOME</FieldLabel>
        <div
          className="flex items-center justify-between rounded-[8px] cursor-pointer"
          style={{
            height: 40, padding: '0 12px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <select
            value={callOutcome}
            onChange={e => setCallOutcome(e.target.value)}
            className="flex-1 bg-transparent outline-none appearance-none cursor-pointer"
            style={{ fontSize: 14, color: 'var(--foreground)' }}
          >
            {CALL_OUTCOME_OPTIONS.map(opt => (
              <option key={opt} value={opt} style={{ backgroundColor: 'var(--card)' }}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0, pointerEvents: 'none' }} />
        </div>
      </div>
    </>
  )
}

function OtherFields({
  activityName,
  setActivityName,
}: {
  activityName: string
  setActivityName: (v: string) => void
}) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <FieldLabel>ACTIVITY NAME</FieldLabel>
      <input
        value={activityName}
        onChange={e => setActivityName(e.target.value)}
        placeholder="What was this activity?"
        className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
        style={{
          height: 40, padding: '0 12px', fontSize: 14,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}

// ── ActivitySpecificFields ────────────────────────────────────────────────────

interface ActivitySpecificProps {
  activityType: string
  venue: string; setVenue: (v: string) => void
  isSponsored: boolean; setIsSponsored: (v: boolean) => void
  vendorEntries: VendorEntry[]; setVendorEntries: (v: VendorEntry[]) => void
  leaveBehind: string; setLeaveBehind: (v: string) => void
  occasion: string; setOccasion: (v: string) => void
  classTopic: string; setClassTopic: (v: string) => void
  ceCredits: string; setCeCredits: (v: string) => void
  attendees: string; setAttendees: (v: string) => void
  giftItem: string; setGiftItem: (v: string) => void
  dealRef: string; setDealRef: (v: string) => void
  callType: 'Phone' | 'Video' | 'In-Person'; setCallType: (v: 'Phone' | 'Video' | 'In-Person') => void
  callOutcome: string; setCallOutcome: (v: string) => void
  activityName: string; setActivityName: (v: string) => void
}

function ActivitySpecificFields(props: ActivitySpecificProps) {
  const sponsorProps = {
    isSponsored: props.isSponsored, setIsSponsored: props.setIsSponsored,
    vendorEntries: props.vendorEntries, setVendorEntries: props.setVendorEntries,
  }

  let content: React.ReactNode = null

  switch (props.activityType) {
    case 'Lunch':
    case 'Coffee':
      content = (
        <>
          <VenueLine venue={props.venue} setVenue={props.setVenue} />
          <SponsorSection {...sponsorProps} />
        </>
      )
      break
    case 'Pop-by':
      content = (
        <PopByFields
          leaveBehind={props.leaveBehind} setLeaveBehind={props.setLeaveBehind}
          occasion={props.occasion} setOccasion={props.setOccasion}
        />
      )
      break
    case 'CE Class':
      content = (
        <CeClassFields
          classTopic={props.classTopic} setClassTopic={props.setClassTopic}
          ceCredits={props.ceCredits} setCeCredits={props.setCeCredits}
          attendees={props.attendees} setAttendees={props.setAttendees}
          venue={props.venue} setVenue={props.setVenue}
          {...sponsorProps}
        />
      )
      break
    case 'Closing Gift':
      content = (
        <ClosingGiftFields
          giftItem={props.giftItem} setGiftItem={props.setGiftItem}
          dealRef={props.dealRef} setDealRef={props.setDealRef}
          {...sponsorProps}
        />
      )
      break
    case 'Call':
      content = (
        <CallFields
          callType={props.callType} setCallType={props.setCallType}
          callOutcome={props.callOutcome} setCallOutcome={props.setCallOutcome}
        />
      )
      break
    case 'Other':
      content = (
        <OtherFields
          activityName={props.activityName} setActivityName={props.setActivityName}
        />
      )
      break
    default:
      return null
  }

  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div style={{ height: 1, backgroundColor: 'var(--border)' }} />
      <FieldLabel>ACTIVITY DETAILS</FieldLabel>
      {content}
    </div>
  )
}

// ── Auto-categorize helper ────────────────────────────────────────────────────

function suggestActivityType(notes: string): string | null {
  const t = notes.toLowerCase()
  if (t.includes('lunch') || t.includes('restaurant') || t.includes('dinner') || t.includes('meal')) return 'Lunch'
  if (t.includes('coffee') || t.includes('café') || t.includes('starbucks') || t.includes('latte')) return 'Coffee'
  if (t.includes('pop') || t.includes('stopped by') || t.includes('dropped by') || t.includes('drop by')) return 'Pop-by'
  if (t.includes('ce class') || t.includes('ce credit') || t.includes('continuing education') || t.includes('class')) return 'CE Class'
  if (t.includes('closing gift') || t.includes('gift basket') || t.includes('gift bag')) return 'Closing Gift'
  if (t.includes('called') || t.includes('phone call') || t.includes('video call') || t.includes('on the phone')) return 'Call'
  return null
}

// ── Main component ───────────────────────────────────────────────────────────

export function LogActivityPanel() {
  const { isOpen, closeLog, editingActivity, prefilledContact } = useActivityLog()
  const { role } = useRole()
  const isManager = role === 'manager'
  const isViewMode = isManager && editingActivity !== null
  const isEditMode = !isManager && editingActivity !== null
  const showToast = useSuccessToast()
  const { theme } = useTheme()
  const [activityType, setActivityType] = useState('Lunch')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [contactSearch, setContactSearch] = useState('')
  const [showContactDrop, setShowContactDrop] = useState(false)
  const [date, setDate] = useState('2026-03-16')
  const [time, setTime] = useState('12:30')
  const [duration, setDuration] = useState('1h 30m')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [requiresFollowUp, setRequiresFollowUp] = useState(true)
  const [followUpDate, setFollowUpDate] = useState('2026-03-23')
  const [mounted, setMounted] = useState(false)

  // Activity-specific state
  const [venue, setVenue] = useState('')
  const [isSponsored, setIsSponsored] = useState(false)
  const [vendorEntries, setVendorEntries] = useState<VendorEntry[]>([])
  const [leaveBehind, setLeaveBehind] = useState('')
  const [occasion, setOccasion] = useState('Regular Visit')
  const [classTopic, setClassTopic] = useState('')
  const [ceCredits, setCeCredits] = useState('')
  const [attendees, setAttendees] = useState('')
  const [giftItem, setGiftItem] = useState('')
  const [dealRef, setDealRef] = useState('')
  const [callType, setCallType] = useState<'Phone' | 'Video' | 'In-Person'>('Phone')
  const [callOutcome, setCallOutcome] = useState('Discussed follow-up')
  const [activityName, setActivityName] = useState('')
  const [activityLabel, setActivityLabel] = useState('')
  const [voiceListening, setVoiceListening] = useState(false)
  const [aiAutoFilled, setAiAutoFilled] = useState(false)

  const contactSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])


  // Pre-populate from editingActivity or prefilledContact
  useEffect(() => {
    if (!isOpen) return
    if (editingActivity) {
      setActivityType(editingActivity.type)
      setActivityLabel(editingActivity.label || '')
      if (editingActivity.contacts?.length) {
        setSelectedContacts(editingActivity.contacts as Contact[])
      } else {
        setContactSearch(editingActivity.contactName)
      }
      setDate(editingActivity.date)
      setTime(editingActivity.time.replace(' AM', '').replace(' PM', ''))
      setCost(editingActivity.spend > 0 ? String(editingActivity.spend) : '')
      setNotes(editingActivity.notes || '')
      setIsSponsored(editingActivity.vendors?.length > 0)
      setVendorEntries(
        (editingActivity.vendors ?? []).map(v => ({
          contact: { id: v.name, name: v.name, initials: v.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), company: v.company },
          coverage: v.coverage,
          amount: v.amount,
        }))
      )
      setRequiresFollowUp(!!editingActivity.followUp)
    } else if (prefilledContact) {
      setContactSearch(prefilledContact)
      setShowContactDrop(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const selectedContactIds = new Set(selectedContacts.map(c => c.id))
  const filteredContacts = (contactsData as Contact[]).filter(c =>
    c.type !== 'vendor' &&
    !selectedContactIds.has(c.id) &&
    (c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
     c.company.toLowerCase().includes(contactSearch.toLowerCase()))
  )

  function handleVoiceRecord() {
    setVoiceListening(true)
    setTimeout(() => {
      setVoiceListening(false)
      // Simulate AI-parsed voice input
      setActivityType('Lunch')
      const michelle = (contactsData as Contact[]).find(c => c.name === 'Michelle Tran') ?? null
      if (michelle) {
        setSelectedContacts([michelle])
        setContactSearch('')
        setShowContactDrop(false)
      }
      setCost('80')
      setNotes('Had lunch with Michelle Tran at Chops, spent about $80. She mentioned she has three closings coming up next month.')
      setAiAutoFilled(true)
    }, 2000)
  }

  function handleSave() {
    showToast('Activity logged successfully')
    closeLog()
    // Fire follow-up suggestion if a contact was selected and notes hint at upcoming events
    if (selectedContacts.length > 0 && notes.toLowerCase().includes('clos')) {
      const primaryContact = selectedContacts[0]
      setTimeout(() => {
        toast({
          title: `${primaryContact.name} mentioned upcoming closings — follow up in 2 weeks?`,
          description: 'AI detected a follow-up opportunity in your notes.',
          action: <ToastAction altText="Schedule follow-up">Schedule</ToastAction>,
          duration: 10000,
        })
      }, 800)
    }
    setActivityType('Lunch')
    setAiAutoFilled(false)
    setSelectedContacts([])
    setContactSearch('')
    setCost('')
    setNotes('')
    setRequiresFollowUp(true)
    // Reset activity-specific fields
    setVenue('')
    setIsSponsored(false)
    setVendorEntries([])
    setLeaveBehind('')
    setOccasion('Regular Visit')
    setClassTopic('')
    setCeCredits('')
    setAttendees('')
    setGiftItem('')
    setDealRef('')
    setCallType('Phone')
    setCallOutcome('Discussed follow-up')
    setActivityName('')
    setActivityLabel('')
    setVoiceListening(false)
    setAiAutoFilled(false)
  }

  function selectContact(c: Contact) {
    setSelectedContacts(prev => [...prev, c])
    setContactSearch('')
    setShowContactDrop(false)
    setTimeout(() => contactSearchRef.current?.focus(), 50)
  }

  function removeContact(id: string) {
    setSelectedContacts(prev => prev.filter(c => c.id !== id))
  }

  if (!mounted) return null

  const tileRows = [activityTiles.slice(0, 4), activityTiles.slice(4)]

  const activitySpecificProps: ActivitySpecificProps = {
    activityType,
    venue, setVenue,
    isSponsored, setIsSponsored,
    vendorEntries, setVendorEntries,
    leaveBehind, setLeaveBehind,
    occasion, setOccasion,
    classTopic, setClassTopic,
    ceCredits, setCeCredits,
    attendees, setAttendees,
    giftItem, setGiftItem,
    dealRef, setDealRef,
    callType, setCallType,
    callOutcome, setCallOutcome,
    activityName, setActivityName,
  }

  return (
    <SlideOverPanel onClose={closeLog} width={560}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col" style={{ padding: '24px 28px 16px 28px', gap: 4 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--foreground)' }}>
              {isViewMode ? 'View Activity' : isEditMode ? 'Edit Activity' : 'Log Activity'}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={closeLog} className="rounded-[6px] p-1 transition-colors hover:bg-[var(--surface)]">
                <X size={20} style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </div>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {isViewMode ? 'Activity details (read-only)' : isEditMode ? 'Edit the details for this activity' : 'Fill in the details for your field activity'}
          </span>
        </div>
        <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />

        {/* ── Scrollable content ──────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20, ...(isViewMode ? { pointerEvents: 'none', opacity: 0.75 } : {}) }}
        >

          {/* AI Auto-fill banner */}
          {aiAutoFilled && (
            <div
              className="flex items-center gap-2 rounded-[8px]"
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(196,165,116,0.08)',
                border: '1px solid rgba(196,165,116,0.3)',
              }}
            >
              <Sparkles size={13} style={{ color: '#c4a574', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--body)' }}>
                AI filled this in — review and save.
              </span>
              <button
                type="button"
                onClick={() => setAiAutoFilled(false)}
                className="ml-auto transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Voice log button */}
          {!isViewMode && !isEditMode && (
            <div className="flex flex-col items-center" style={{ gap: 8, paddingTop: 4, paddingBottom: 4 }}>
              <button
                type="button"
                onClick={handleVoiceRecord}
                disabled={voiceListening}
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: voiceListening ? 'rgba(196,165,116,0.85)' : '#c4a574',
                  boxShadow: voiceListening
                    ? '0 0 0 8px rgba(196,165,116,0.2), 0 0 0 16px rgba(196,165,116,0.08)'
                    : '0 4px 16px rgba(196,165,116,0.35)',
                  cursor: voiceListening ? 'default' : 'pointer',
                  animation: voiceListening ? 'pulse 1s ease-in-out infinite' : 'none',
                  border: 'none',
                  outline: 'none',
                  flexShrink: 0,
                }}
                aria-label={voiceListening ? 'Listening…' : 'Voice log'}
              >
                <Mic size={26} style={{ color: '#000000' }} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: voiceListening ? '#c4a574' : 'var(--muted)', letterSpacing: '0.02em' }}>
                {voiceListening ? 'Listening…' : 'Tap to voice log'}
              </span>
              {!voiceListening && (
                <span style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7, textAlign: 'center', maxWidth: 220 }}>
                  Describe your activity and AI will fill in the fields
                </span>
              )}
            </div>
          )}

          {/* Section 1 — Activity type tiles */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            <div className="flex items-center justify-between">
              <FieldLabel>ACTIVITY TYPE</FieldLabel>
              {(() => {
                const suggested = suggestActivityType(notes)
                if (!suggested || suggested === activityType) return null
                return (
                  <button
                    type="button"
                    onClick={() => setActivityType(suggested)}
                    className="flex items-center gap-1 rounded-full transition-colors hover:opacity-80"
                    style={{
                      height: 22,
                      paddingLeft: 8,
                      paddingRight: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#c4a574',
                      border: '1px solid rgba(196,165,116,0.5)',
                      backgroundColor: 'rgba(196,165,116,0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={10} />
                    Suggested: {suggested}
                  </button>
                )
              })()}
            </div>
            {tileRows.map((row, ri) => (
              <div
                key={ri}
                className={ri === 0 ? 'grid grid-cols-4' : 'grid grid-cols-3'}
                style={{ gap: 8 }}
              >
                {row.map(tile => {
                  const active = activityType === tile.label
                  return (
                    <button
                      key={tile.label}
                      onClick={() => setActivityType(tile.label)}
                      className="flex flex-col items-center justify-center rounded-[8px] transition-all"
                      style={{
                        height: 72, gap: 6, fontSize: 11, fontWeight: 500,
                        backgroundColor: active
                          ? (theme === 'dark' ? '#1f1a12' : '#fdf8f0')
                          : 'var(--surface)',
                        border: active ? '2px solid #c4a574' : '1px solid var(--border)',
                        color: active ? '#c4a574' : 'var(--muted)',
                        boxShadow: active ? '0 0 0 3px rgba(196,165,116,0.12)' : 'none',
                      }}
                    >
                      <tile.icon size={18} />
                      {tile.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Section 2 — Activity Name */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>ACTIVITY NAME <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></FieldLabel>
            <input
              value={activityLabel}
              onChange={e => setActivityLabel(e.target.value)}
              placeholder="e.g. Lunch with Mike re: Q2 pipeline"
              className="w-full rounded-[8px] px-3 text-sm outline-none transition-colors"
              style={{
                height: 40,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#c4a574'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,165,116,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Section 3 — Contacts (multi-select) */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>CONTACTS</FieldLabel>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {/* Added contact rows */}
              {selectedContacts.map(c => (
                <div
                  key={c.id}
                  className="flex items-center rounded-[8px]"
                  style={{
                    padding: '8px 12px', gap: 8,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#ffffff' }}
                  >
                    {c.initials}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.company}</span>
                  </div>
                  <button type="button" onClick={() => removeContact(c.id)} className="shrink-0">
                    <X size={14} style={{ color: 'var(--muted)' }} />
                  </button>
                </div>
              ))}

              {/* Search input — always shown */}
              <div className="relative">
                <input
                  ref={contactSearchRef}
                  value={contactSearch}
                  onChange={e => { setContactSearch(e.target.value); setShowContactDrop(true) }}
                  onFocus={() => setShowContactDrop(true)}
                  onBlur={() => setTimeout(() => setShowContactDrop(false), 150)}
                  placeholder={selectedContacts.length > 0 ? 'Add another contact…' : 'Search by name or company'}
                  className="w-full rounded-[8px] outline-none focus:ring-1 focus:ring-[#c4a574] transition-shadow"
                  style={{
                    height: 40, padding: '0 12px', fontSize: 14,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                {showContactDrop && filteredContacts.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-[44px] z-10 rounded-[8px] overflow-hidden"
                    style={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {filteredContacts.map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => selectContact(c)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--surface)]"
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: '#c4a574', fontSize: 10, fontWeight: 600, color: '#ffffff' }}
                        >
                          {c.initials}
                        </div>
                        <div className="flex flex-col items-start" style={{ gap: 1 }}>
                          <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.company}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 — Date / Time */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
            <div className="flex flex-col" style={{ gap: 6 }}>
              <FieldLabel>DATE</FieldLabel>
              <DatePickerInput value={date} onChange={setDate} />
            </div>
            <div className="flex flex-col" style={{ gap: 6 }}>
              <FieldLabel>TIME</FieldLabel>
              <TimePickerInput value={time} onChange={setTime} />
            </div>
          </div>

          {/* Section 4 — Duration / Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
            <div className="flex flex-col" style={{ gap: 6 }}>
              <FieldLabel>DURATION</FieldLabel>
              <div
                className="flex items-center justify-between rounded-[8px] cursor-pointer"
                style={{
                  height: 40, padding: '0 12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="flex-1 bg-transparent outline-none appearance-none cursor-pointer"
                  style={{ fontSize: 14, color: 'var(--foreground)' }}
                >
                  {durationOptions.map(opt => (
                    <option key={opt} value={opt} style={{ backgroundColor: 'var(--card)' }}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0, pointerEvents: 'none' }} />
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: 6 }}>
              <FieldLabel>COST</FieldLabel>
              <div
                className="flex items-center rounded-[8px]"
                style={{
                  height: 40, padding: '0 12px', gap: 4,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontSize: 14, color: 'var(--foreground)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 5 — Activity-specific fields */}
          <ActivitySpecificFields key={activityType} {...activitySpecificProps} />

          {/* Section 6 — Notes */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <FieldLabel>NOTES</FieldLabel>
            <div
              className="flex flex-col justify-between rounded-[8px]"
              style={{ height: 88, padding: 12, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 500))}
                placeholder="Add notes about this activity…"
                className="flex-1 resize-none bg-transparent outline-none"
                style={{ fontSize: 14, color: 'var(--foreground)' }}
              />
              <span className="text-right" style={{ fontSize: 12, color: 'var(--muted)' }}>
                {notes.length} / 500
              </span>
            </div>
          </div>

          {/* Section 7 — Photo / Receipt */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <FieldLabel>PHOTO OR RECEIPT</FieldLabel>
              <span
                className="rounded-[4px]"
                style={{ fontSize: 10, padding: '2px 6px', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Optional
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center rounded-[8px] cursor-pointer transition-colors hover:bg-[var(--surface)]"
              style={{ height: 72, gap: 4, border: '1px dashed #c4a574' }}
            >
              <Upload size={16} style={{ color: 'var(--muted)' }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Drop file or tap to upload</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7 }}>JPG, PNG, PDF up to 10MB</span>
            </div>
          </div>

          {/* Section 8 — Follow-up toggle */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col" style={{ gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
                  Requires Follow-up
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Add a reminder to follow up with this contact
                </span>
              </div>
              <button
                onClick={() => setRequiresFollowUp(p => !p)}
                className="shrink-0 rounded-full transition-colors"
                style={{
                  width: 40, height: 22, padding: 2,
                  backgroundColor: requiresFollowUp ? '#c4a574' : 'var(--border)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: requiresFollowUp ? 'flex-end' : 'flex-start',
                }}
                aria-label="Toggle follow-up"
              >
                <div className="rounded-full bg-white" style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {requiresFollowUp && (
              <div className="flex flex-col" style={{ gap: 6 }}>
                <FieldLabel>FOLLOW-UP DATE</FieldLabel>
                <DatePickerInput value={followUpDate} onChange={setFollowUpDate} goldBorder />
              </div>
            )}
          </div>

          <div style={{ height: 8 }} />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{ height: 1, backgroundColor: 'var(--border)', flexShrink: 0 }} />
        <div
          className="flex shrink-0 items-center"
          style={{ height: 72, padding: '0 28px', gap: 12, justifyContent: isEditMode ? 'space-between' : 'flex-end' }}
        >
          {isViewMode && (
            <button
              onClick={closeLog}
              className="rounded-[8px] transition-colors hover:bg-[var(--surface)]"
              style={{ height: 40, padding: '0 20px', fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}
            >
              Close
            </button>
          )}
          {isEditMode && (
            <>
              <button
                onClick={() => { showToast('Activity deleted'); closeLog() }}
                className="rounded-[8px] transition-colors"
                style={{ height: 40, padding: '0 16px', fontSize: 14, fontWeight: 500, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Delete Activity
              </button>
              <div className="flex items-center" style={{ gap: 12 }}>
                <button
                  onClick={closeLog}
                  className="rounded-[8px] transition-colors hover:bg-[var(--surface)]"
                  style={{ height: 40, padding: '0 16px', fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-[8px] font-medium transition-opacity hover:opacity-90"
                  style={{
                    height: 40, width: 140, fontSize: 14, fontWeight: 500,
                    backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
                    color: theme === 'dark' ? '#000000' : '#fafaf9',
                  }}
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
                className="rounded-[8px] transition-colors hover:bg-[var(--surface)]"
                style={{ height: 40, padding: '0 16px', fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-[8px] font-medium transition-opacity hover:opacity-90"
                style={{
                  height: 40, width: 140, fontSize: 14, fontWeight: 500,
                  backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
                  color: theme === 'dark' ? '#000000' : '#fafaf9',
                }}
              >
                Save Activity
              </button>
            </>
          )}
        </div>
    </SlideOverPanel>
  )
}

// ── Helper ───────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--muted)' }}>
      {children}
    </span>
  )
}
