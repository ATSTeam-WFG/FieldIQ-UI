'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '@/lib/api/auth'

export type Role = 'rep' | 'manager' | 'executive'
export type UserType = 'rep' | 'manager'

export interface Persona {
  name: string
  initials: string
  title: string
  territory?: string
}

const emptyPersona: Persona = { name: '', initials: '', title: '' }

interface RoleContextValue {
  role: Role
  persona: Persona
  setRole: (role: Role) => void
  userType: UserType
  canSwitch: boolean
  loaded: boolean
}

const RoleContext = createContext<RoleContextValue>({
  role: 'rep',
  persona: emptyPersona,
  setRole: () => {},
  userType: 'rep',
  canSwitch: false,
  loaded: false,
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType>('rep')
  const [role, setRole] = useState<Role>('rep')
  const [persona, setPersona] = useState<Persona>(emptyPersona)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('fieldiq_token')
    if (!token) {
      setLoaded(true)
      return
    }
    getMe()
      .then(user => {
        const r: Role = user.role === 'manager' ? 'manager' : 'rep'
        setRole(r)
        setUserType(r as UserType)
        setPersona({
          name: user.name,
          initials: user.initials,
          title: user.title ?? (r === 'manager' ? 'Sales Manager' : 'Sales Rep'),
          territory: user.territory ?? undefined,
        })
      })
      .catch(() => {
        // 401 is already handled by the API client (redirects to /login)
      })
      .finally(() => {
        setLoaded(true)
      })
  }, [])

  // Managers who also act as reps can switch views
  const canSwitch = userType === 'manager'

  return (
    <RoleContext.Provider value={{ role, persona, setRole, userType, canSwitch, loaded }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
