'use client'

import { createContext, useContext, useState } from 'react'

interface FeedbackContextValue {
  isOpen: boolean
  openFeedback: () => void
  closeFeedback: () => void
}

const FeedbackContext = createContext<FeedbackContextValue>({
  isOpen: false,
  openFeedback: () => {},
  closeFeedback: () => {},
})

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FeedbackContext.Provider
      value={{
        isOpen,
        openFeedback: () => setIsOpen(true),
        closeFeedback: () => setIsOpen(false),
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}

export const useFeedback = () => useContext(FeedbackContext)
