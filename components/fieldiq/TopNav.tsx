'use client'

import { useEffect } from 'react'
import { Bell, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { useRole } from '@/lib/context/RoleContext'
import { useNotifications } from '@/lib/context/NotificationContext'
import { useSearch } from '@/lib/context/SearchContext'
import { RoleSwitcher } from './RoleSwitcher'

const roleBadgeLabel: Record<string, string> = {
  rep: 'REP',
  manager: 'MANAGER',
  executive: 'EXECUTIVE',
}

export function TopNav() {
  const { theme, toggleTheme } = useTheme()
  const { role } = useRole()
  const { openNotifications, unreadCount } = useNotifications()
  const { openSearch } = useSearch()

  // Global Cmd+K / Ctrl+K hotkey
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSearch])

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

      {/* Center: search trigger — desktop only */}
      <div className="hidden md:flex flex-1 min-w-0 justify-center max-w-md mx-auto">
        <button
          onClick={openSearch}
          className="flex items-center gap-2 w-full min-w-0 rounded-[8px] border px-3 py-1.5 transition-colors hover:bg-[var(--surface)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            cursor: 'pointer',
          }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
          <span
            className="flex-1 min-w-0 truncate text-sm text-left"
            style={{ color: 'var(--muted)' }}
          >
            Search contacts…
          </span>
          <span
            className="flex items-center gap-0.5 rounded px-1 py-0.5"
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: controls */}
      <div className="flex flex-1 md:flex-none items-center justify-end gap-1 shrink-0">
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

        {/* Search icon — mobile only */}
        <button
          onClick={openSearch}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--surface)] focus:outline-none"
          aria-label="Search"
        >
          <Search className="h-4 w-4" style={{ color: 'var(--muted)' }} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={openNotifications}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--surface)] focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          </button>
          {unreadCount > 0 && (
            <div
              className="absolute top-0 right-0 rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: '#c4a574',
                border: '2px solid var(--card)',
              }}
            />
          )}
        </div>

        {/* Persona switcher */}
        <RoleSwitcher />
      </div>
    </header>
  )
}
