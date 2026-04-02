'use client'

import { createContext, useContext, useState } from 'react'

interface InviteAgentContextValue {
  isOpen: boolean
  openInviteAgent: () => void
  closeInviteAgent: () => void
}

const InviteAgentContext = createContext<InviteAgentContextValue>({
  isOpen: false,
  openInviteAgent: () => {},
  closeInviteAgent: () => {},
})

export function InviteAgentProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <InviteAgentContext.Provider
      value={{
        isOpen,
        openInviteAgent: () => setIsOpen(true),
        closeInviteAgent: () => setIsOpen(false),
      }}
    >
      {children}
    </InviteAgentContext.Provider>
  )
}

export const useInviteAgent = () => useContext(InviteAgentContext)
