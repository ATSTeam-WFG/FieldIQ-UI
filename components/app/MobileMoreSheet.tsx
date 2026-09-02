'use client'

import Link from 'next/link'
import { X, FileText, TrendingUp, Settings, HelpCircle, BarChart2, ChevronRight, ArrowDownUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MoreTab {
  label: string
  href: string
  icon: LucideIcon
}

const agentTabs: MoreTab[] = [
  { label: 'Contracts',            href: '/contracts',    icon: FileText    },
  { label: 'My Performance',       href: '/performance',  icon: TrendingUp  },
  { label: 'Imports/Exports',      href: '/exports',      icon: ArrowDownUp },
  { label: 'Settings',             href: '/settings',     icon: Settings    },
  { label: 'Help & Support',       href: '/coming-soon',  icon: HelpCircle  },
]

const managerTabs: MoreTab[] = [
  { label: 'Performance',    href: '/performance',  icon: TrendingUp  },
  { label: 'Reports',        href: '/coming-soon',  icon: BarChart2   },
  { label: 'Imports/Exports', href: '/exports',     icon: ArrowDownUp },
  { label: 'Settings',       href: '/settings',     icon: Settings    },
  { label: 'Help & Support', href: '/coming-soon',  icon: HelpCircle  },
]

interface MobileMoreSheetProps {
  isOpen: boolean
  onClose: () => void
  role: 'agent' | 'manager'
}

export function MobileMoreSheet({ onClose, role }: MobileMoreSheetProps) {
  const tabs = role === 'manager' ? managerTabs : agentTabs

  return (
    <>
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderRadius: '16px 16px 0 0',
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px 12px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>More</span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, border: 'none', backgroundColor: 'transparent',
              color: 'var(--muted)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab rows */}
        {tabs.map(tab => (
          <Link
            key={tab.label}
            href={tab.href}
            onClick={onClose}
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 16,
              borderBottom: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <tab.icon size={18} color="var(--muted)" />
            </div>
            <span style={{ flex: 1, fontSize: 14, color: 'var(--foreground)' }}>{tab.label}</span>
            <ChevronRight size={16} color="var(--muted)" />
          </Link>
        ))}

        <div style={{ paddingBottom: 32 }} />
      </motion.div>
    </>
  )
}
