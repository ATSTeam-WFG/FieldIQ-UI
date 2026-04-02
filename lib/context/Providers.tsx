'use client'

import { ThemeProvider } from './ThemeContext'
import { RoleProvider } from './RoleContext'
import { ActivityLogProvider } from './ActivityLogContext'
import { AddContactProvider } from './AddContactContext'
import { NotificationProvider } from './NotificationContext'
import { SearchProvider } from './SearchContext'
import { ContractProvider } from './ContractContext'
import { InviteAgentProvider } from './InviteAgentContext'
import { TeamBroadcastProvider } from './TeamBroadcastContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ActivityLogProvider>
          <AddContactProvider>
            <ContractProvider>
              <InviteAgentProvider>
                <TeamBroadcastProvider>
                  <NotificationProvider>
                    <SearchProvider>
                      {children}
                    </SearchProvider>
                  </NotificationProvider>
                </TeamBroadcastProvider>
              </InviteAgentProvider>
            </ContractProvider>
          </AddContactProvider>
        </ActivityLogProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}
