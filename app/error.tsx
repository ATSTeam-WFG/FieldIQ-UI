'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="flex flex-col items-center text-center rounded-[8px]"
        style={{
          padding: '48px 32px',
          maxWidth: 400,
          width: '100%',
          borderTop: '2px solid #c4a574',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
          Something went wrong
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          An unexpected error occurred. You can try again or return to the dashboard.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#000',
              backgroundColor: '#c4a574',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
