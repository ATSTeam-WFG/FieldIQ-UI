'use client'

import { createContext, useContext, useState } from 'react'

interface SearchContextValue {
  isOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

const SearchContext = createContext<SearchContextValue>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
})

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        openSearch: () => setIsOpen(true),
        closeSearch: () => setIsOpen(false),
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
