'use client'

import { ThemeProvider } from './ThemeContext'
import { RoleProvider } from './RoleContext'
import { ActivityLogProvider } from './ActivityLogContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ActivityLogProvider>
          {children}
        </ActivityLogProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}
