'use client'

import { createContext, useContext, useState } from 'react'

interface ActivityLogContextValue {
  isOpen: boolean
  openLog: () => void
  closeLog: () => void
}

const ActivityLogContext = createContext<ActivityLogContextValue>({
  isOpen: false,
  openLog: () => {},
  closeLog: () => {},
})

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ActivityLogContext.Provider
      value={{
        isOpen,
        openLog: () => setIsOpen(true),
        closeLog: () => setIsOpen(false),
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  )
}

export const useActivityLog = () => useContext(ActivityLogContext)
