'use client'

import { createContext, useContext, useState } from 'react'

export interface ContactRecord {
  id: string
  name: string
  initials: string
  company: string
  role: string
  type: string
  email: string
  phone: string
  tags: string[]
  [key: string]: unknown
}

interface AddContactContextValue {
  isOpen: boolean
  editingContact: ContactRecord | null
  openAddContact: () => void
  openEditContact: (contact: ContactRecord) => void
  closeAddContact: () => void
}

const AddContactContext = createContext<AddContactContextValue>({
  isOpen: false,
  editingContact: null,
  openAddContact: () => {},
  openEditContact: () => {},
  closeAddContact: () => {},
})

export function AddContactProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(null)

  return (
    <AddContactContext.Provider
      value={{
        isOpen,
        editingContact,
        openAddContact: () => {
          setEditingContact(null)
          setIsOpen(true)
        },
        openEditContact: (contact) => {
          setEditingContact(contact)
          setIsOpen(true)
        },
        closeAddContact: () => {
          setIsOpen(false)
          setEditingContact(null)
        },
      }}
    >
      {children}
    </AddContactContext.Provider>
  )
}

export const useAddContact = () => useContext(AddContactContext)
