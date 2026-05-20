'use client'

import { useRouter } from 'next/navigation'

export default function AgentDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 p-6">
      <button
        onClick={() => router.push('/team')}
        style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', width: 'fit-content', background: 'none', border: 'none', cursor: 'pointer' }}
        className="hover:text-[var(--foreground)] transition-colors"
      >
        ← Team
      </button>
      <div
        className="flex flex-col items-center justify-center rounded-[8px]"
        style={{
          padding: '64px 24px',
          borderTop: '2px solid #c4a574',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
          Rep data unavailable
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 320, marginBottom: 20 }}>
          There was a problem loading this rep&apos;s data.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            style={{ fontSize: 13, fontWeight: 600, color: '#000', backgroundColor: '#c4a574', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/team')}
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Back to Team
          </button>
        </div>
      </div>
    </div>
  )
}
