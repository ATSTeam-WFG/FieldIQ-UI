'use client'

import { createContext, useContext, useState } from 'react'

export type Role = 'rep' | 'manager' | 'executive'
export type UserType = 'rep' | 'manager'

export interface Persona {
  name: string
  initials: string
  title: string
  territory?: string
}

const personas: Record<Role, Persona> = {
  rep: {
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Senior Sales Rep',
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
  userType: UserType
  canSwitch: boolean
}

const RoleContext = createContext<RoleContextValue>({
  role: 'manager',
  persona: personas.manager,
  setRole: () => {},
  userType: 'manager',
  canSwitch: true,
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // userType represents who is actually logged in — never changes at runtime.
  // Defaults to 'manager' so the demo can showcase both views.
  const [userType] = useState<UserType>('manager')
  const [role, setRole] = useState<Role>('manager')

  const canSwitch = userType === 'manager'

  return (
    <RoleContext.Provider value={{ role, persona: personas[role], setRole, userType, canSwitch }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
