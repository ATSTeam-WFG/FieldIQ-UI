'use client'

import { createContext, useContext, useState } from 'react'

export type Role = 'agent' | 'manager' | 'executive'

export interface Persona {
  name: string
  initials: string
  title: string
  territory?: string
}

const personas: Record<Role, Persona> = {
  agent: {
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Senior Title Agent',
    territory: 'Buckhead',
  },
  manager: {
    name: 'Jane Doe',
    initials: 'JD',
    title: 'Regional Sales Manager',
  },
  executive: {
    name: 'Robert Mills',
    initials: 'RM',
    title: 'VP of Operations',
  },
}

interface RoleContextValue {
  role: Role
  persona: Persona
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: 'agent',
  persona: personas.agent,
  setRole: () => {},
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('agent')

  return (
    <RoleContext.Provider value={{ role, persona: personas[role], setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
