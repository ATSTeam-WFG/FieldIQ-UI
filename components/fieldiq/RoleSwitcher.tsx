'use client'

import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRole, type Role } from '@/lib/context/RoleContext'

const roleOptions: { role: Role; name: string; label: string }[] = [
  { role: 'agent',     name: 'Sarah Chen',   label: 'Senior Title Agent' },
  { role: 'manager',   name: 'Jane Doe',     label: 'Regional Sales Manager' },
  { role: 'executive', name: 'Robert Mills', label: 'VP of Operations' },
]

export function RoleSwitcher() {
  const { role, persona, setRole } = useRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-[8px] px-2 py-1 transition-colors hover:bg-[var(--surface)] focus:outline-none"
          style={{ color: 'var(--body)' }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#c4a574', color: '#ffffff' }}
          >
            {persona.initials}
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-sm font-semibold leading-none" style={{ color: 'var(--foreground)' }}>
              {persona.name}
            </span>
            <span className="text-xs leading-none mt-0.5" style={{ color: 'var(--muted)' }}>
              {persona.title}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Persona</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roleOptions.map(option => (
          <DropdownMenuItem
            key={option.role}
            onClick={() => setRole(option.role)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              {role === option.role && (
                <Check className="h-4 w-4" style={{ color: '#c4a574' }} />
              )}
            </span>
            <div className="flex flex-col">
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                {option.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {option.label}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
