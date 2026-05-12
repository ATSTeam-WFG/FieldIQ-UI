'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface ActionTile {
  icon: LucideIcon
  title: string
  description: string
  buttonLabel: string
  onClick?: () => void
  href?: string
}

interface WelcomeBannerProps {
  headline: string
  subtext: string
  tiles: ActionTile[]
}

export function WelcomeBanner({ headline, subtext, tiles }: WelcomeBannerProps) {
  return (
    <div
      className="rounded-[8px]"
      style={{
        backgroundColor: 'var(--card)',
        borderTop: '2px solid #c4a574',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '20px 20px 18px',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: 0, marginBottom: 4 }}>
          {headline}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
          {subtext}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: 10 }}>
        {tiles.map(tile => (
          <ActionTileCard key={tile.title} tile={tile} />
        ))}
      </div>
    </div>
  )
}

function ActionTileCard({ tile }: { tile: ActionTile }) {
  const { icon: Icon, title, description, buttonLabel, onClick, href } = tile

  const btn = href ? (
    <Link
      href={href}
      className="hover:opacity-90 active:opacity-80"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: 28, paddingLeft: 12, paddingRight: 12,
        fontSize: 12, fontWeight: 600,
        backgroundColor: '#c4a574', color: '#000000',
        borderRadius: 6, textDecoration: 'none',
        transition: 'opacity 0.15s',
      }}
    >
      {buttonLabel}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className="hover:opacity-90 active:opacity-80"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: 28, paddingLeft: 12, paddingRight: 12,
        fontSize: 12, fontWeight: 600,
        backgroundColor: '#c4a574', color: '#000000',
        border: 'none', borderRadius: 6, cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
    >
      {buttonLabel}
    </button>
  )

  return (
    <div
      className="flex flex-col rounded-[8px]"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '12px 14px',
        gap: 8,
      }}
    >
      <div
        className="flex items-center justify-center rounded-[6px]"
        style={{ width: 30, height: 30, backgroundColor: 'var(--card)', border: '1px solid var(--border)', flexShrink: 0 }}
      >
        <Icon size={14} style={{ color: 'var(--muted)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{description}</span>
      </div>
      <div>{btn}</div>
    </div>
  )
}
