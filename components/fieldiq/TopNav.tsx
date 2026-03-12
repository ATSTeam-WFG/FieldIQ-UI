'use client'

import { Bell, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { useRole } from '@/lib/context/RoleContext'
import { RoleSwitcher } from './RoleSwitcher'

const roleBadgeLabel: Record<string, string> = {
  agent: 'AGENT',
  manager: 'MANAGER',
  executive: 'EXECUTIVE',
}

export function TopNav() {
  const { theme, toggleTheme } = useTheme()
  const { role } = useRole()

  return (
    <header
      className="flex h-14 items-center gap-4 border-b px-6"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left: wordmark + role badge */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          FieldIQ
        </span>
        <div
          className="h-4 w-px"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <span
          className="rounded-full border px-2 py-0.5 font-semibold"
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            borderColor: '#c4a574',
            color: '#c4a574',
          }}
        >
          {roleBadgeLabel[role]}
        </span>
      </div>

      {/* Center: search */}
      <div className="flex flex-1 justify-center max-w-md mx-auto">
        <div
          className="flex items-center gap-2 w-full rounded-[8px] border px-3 py-1.5"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search contacts, activity…"
            readOnly
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-current cursor-default"
            style={{ color: 'var(--muted)' }}
          />
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--surface)] focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          ) : (
            <Moon className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          )}
        </button>

        {/* Notifications */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--surface)] focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" style={{ color: 'var(--muted)' }} />
        </button>

        {/* Persona switcher */}
        <RoleSwitcher />
      </div>
    </header>
  )
}
