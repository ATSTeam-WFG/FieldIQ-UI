'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2,
  BookUser,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { useRole } from '@/lib/context/RoleContext'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Team',      icon: Users,           href: '/manager'   },
  { label: 'Activity Log', icon: ClipboardList,   href: '/coming-soon' },
  { label: 'Contacts',     icon: BookUser,        href: '/coming-soon' },
  { label: 'Reports',      icon: BarChart2,       href: '/coming-soon' },
  { label: 'Settings',     icon: Settings,        href: '/coming-soon' },
]

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem }: SidebarProps) {
  const pathname = usePathname()
  const { persona } = useRole()

  return (
    <aside
      className="flex h-full w-[220px] shrink-0 flex-col border-r"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(item => {
          const isActive = activeItem
            ? activeItem === item.label
            : pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-r-[8px] px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'sidebar-item-active'
                  : 'hover:bg-[var(--surface)]'
              )}
              style={{
                color: isActive ? 'var(--foreground)' : 'var(--muted)',
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Agent card at bottom */}
      <div
        className="border-t p-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 rounded-[8px] px-3 py-2.5">
          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#c4a574', color: '#ffffff' }}
          >
            {persona.initials}
          </div>

          {/* Name + role */}
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate text-sm font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {persona.name}
            </span>
            <span
              className="truncate text-xs"
              style={{ color: 'var(--muted)' }}
            >
              {persona.title}
            </span>
          </div>

          {/* Active dot */}
          <div
            className="ml-auto h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: '#c4a574' }}
          />
        </div>
      </div>
    </aside>
  )
}
