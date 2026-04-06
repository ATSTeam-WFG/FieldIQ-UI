'use client'

import { createContext, useContext, useState } from 'react'

export interface ActivityContact {
  id: string
  name: string
  initials: string
  company: string
}

export interface ActivityVendor {
  name: string
  company: string
  coverage: 'Full' | 'Partial'
  amount: string
}

export interface ActivityRecord {
  id: string
  agentName: string
  agentInitials: string
  type: string
  // Legacy fields kept for backward compat with dashboard/contacts pages
  contactName: string
  contactCompany: string
  sponsored: boolean
  // New multi-contact / multi-vendor fields
  contacts: ActivityContact[]
  vendors: ActivityVendor[]
  date: string
  time: string
  notes: string
  spend: number
  followUp: string
  status: string
  label: string
}

interface ActivityLogContextValue {
  isOpen: boolean
  editingActivity: ActivityRecord | null
  prefilledContact: string | null
  openLog: () => void
  openActivity: (act: ActivityRecord) => void
  openLogWithContact: (contactName: string) => void
  closeLog: () => void
}

const ActivityLogContext = createContext<ActivityLogContextValue>({
  isOpen: false,
  editingActivity: null,
  prefilledContact: null,
  openLog: () => {},
  openActivity: () => {},
  openLogWithContact: () => {},
  closeLog: () => {},
})

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null)
  const [prefilledContact, setPrefilledContact] = useState<string | null>(null)

  return (
    <ActivityLogContext.Provider
      value={{
        isOpen,
        editingActivity,
        prefilledContact,
        openLog: () => {
          setEditingActivity(null)
          setPrefilledContact(null)
          setIsOpen(true)
        },
        openActivity: (act) => {
          setEditingActivity(act)
          setPrefilledContact(null)
          setIsOpen(true)
        },
        openLogWithContact: (contactName) => {
          setEditingActivity(null)
          setPrefilledContact(contactName)
          setIsOpen(true)
        },
        closeLog: () => {
          setIsOpen(false)
          setEditingActivity(null)
          setPrefilledContact(null)
        },
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  )
}

export const useActivityLog = () => useContext(ActivityLogContext)
