'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '@/lib/api/auth'
import { attemptRefresh } from '@/lib/api/client'

function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch { return null }
}

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
  isAuthenticated: boolean
}

const RoleContext = createContext<RoleContextValue>({
  role: 'rep',
  persona: emptyPersona,
  setRole: () => {},
  userType: 'rep',
  canSwitch: false,
  loaded: false,
  isAuthenticated: false,
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType>('rep')
  const [role, setRole] = useState<Role>('rep')
  const [persona, setPersona] = useState<Persona>(emptyPersona)
  const [loaded, setLoaded] = useState(false)
  const [alsoRep, setAlsoRep] = useState(false)

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
        setAlsoRep(user.also_rep ?? false)
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

  useEffect(() => {
    if (!loaded) return
    let timer: ReturnType<typeof setTimeout>
    function schedule() {
      const token = typeof window !== 'undefined' && localStorage.getItem('fieldiq_token')
      if (!token) return
      const exp = getTokenExp(token)
      if (!exp) return
      const ms = exp * 1000 - Date.now() - 5 * 60 * 1000
      if (ms <= 0) return
      timer = setTimeout(async () => {
        try { await attemptRefresh(); schedule() } catch { /* redirect handled by 401 handler */ }
      }, ms)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [loaded])

  // Only managers who also act as reps can switch views
  const canSwitch = userType === 'manager' && alsoRep
  const isAuthenticated = loaded && persona.name !== ''

  return (
    <RoleContext.Provider value={{ role, persona, setRole, userType, canSwitch, loaded, isAuthenticated }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
