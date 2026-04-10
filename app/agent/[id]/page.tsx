'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/fieldiq/AppShell'

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <AppShell activeItem="Dashboard">
      <div className="flex flex-col gap-4 p-6">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/manager')}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', width: 'fit-content' }}
          className="hover:text-[var(--foreground)] transition-colors"
        >
          ← Team Leaderboard
        </button>

        {/* Page header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.1 }}>
            Rep Detail
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>
            Manager View
          </p>
        </div>

        {/* Empty state */}
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
            Rep data not available
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 320 }}>
            This feature requires a backend API endpoint that has not been implemented yet.
          </p>
        </div>

      </div>
    </AppShell>
  )
}
