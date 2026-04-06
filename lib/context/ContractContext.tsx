'use client'

import { createContext, useContext, useState } from 'react'

export interface ContractRecord {
  id: string
  agentName: string
  contactId: string
  contactName: string
  contactCompany: string
  fileNumber: string
  address: string
  type: 'Regular' | 'Refinance' | 'Commercial'
  status: 'opened' | 'closed' | 'cancelled'
  amount: number
  expectedClosingDate?: string
  actualClosingDate?: string
  createdDate: string
  notes?: string
}

interface ContractContextValue {
  isOpen: boolean
  editingContract: ContractRecord | null
  openLog: () => void
  openContract: (contract: ContractRecord) => void
  closeLog: () => void
}

const ContractContext = createContext<ContractContextValue>({
  isOpen: false,
  editingContract: null,
  openLog: () => {},
  openContract: () => {},
  closeLog: () => {},
})

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<ContractRecord | null>(null)

  return (
    <ContractContext.Provider
      value={{
        isOpen,
        editingContract,
        openLog: () => {
          setEditingContract(null)
          setIsOpen(true)
        },
        openContract: (contract) => {
          setEditingContract(contract)
          setIsOpen(true)
        },
        closeLog: () => {
          setIsOpen(false)
          setEditingContract(null)
        },
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => useContext(ContractContext)
