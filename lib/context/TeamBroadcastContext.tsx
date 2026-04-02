'use client'

import { createContext, useContext, useState } from 'react'

interface TeamBroadcastContextValue {
  isOpen: boolean
  openBroadcast: () => void
  closeBroadcast: () => void
}

const TeamBroadcastContext = createContext<TeamBroadcastContextValue>({
  isOpen: false,
  openBroadcast: () => {},
  closeBroadcast: () => {},
})

export function TeamBroadcastProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TeamBroadcastContext.Provider
      value={{
        isOpen,
        openBroadcast: () => setIsOpen(true),
        closeBroadcast: () => setIsOpen(false),
      }}
    >
      {children}
    </TeamBroadcastContext.Provider>
  )
}

export const useTeamBroadcast = () => useContext(TeamBroadcastContext)
