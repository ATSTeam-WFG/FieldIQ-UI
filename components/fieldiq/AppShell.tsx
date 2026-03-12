'use client'

import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  activeItem?: string
  children: React.ReactNode
}

export function AppShell({ activeItem, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top navigation bar */}
      <TopNav />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex h-full">
          <Sidebar activeItem={activeItem} />
        </div>

        {/* Main content area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: bottom tab bar */}
      <div
        className="flex md:hidden border-t"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {[
          { label: 'Home',     href: '/dashboard' },
          { label: 'Team',     href: '/manager'   },
          { label: 'Activity', href: '/coming-soon' },
          { label: 'Contacts', href: '/coming-soon' },
          { label: 'Reports',  href: '/coming-soon' },
        ].map(item => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
