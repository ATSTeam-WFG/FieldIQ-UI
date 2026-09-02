'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export function ComingSoon() {
  const router = useRouter()

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Wordmark */}
      <p
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{ color: '#c4a574' }}
      >
        {BRAND.name}
      </p>

      {/* Heading */}
      <h1
        className="mb-3 text-center text-3xl font-semibold"
        style={{ color: 'var(--foreground)' }}
      >
        This screen is coming soon
      </h1>

      {/* Description */}
      <p
        className="mb-8 max-w-sm text-center text-sm"
        style={{ color: 'var(--muted)' }}
      >
        This feature is part of the full {BRAND.name} product. We&apos;re building it out now.
      </p>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-[8px] border px-4 py-2 text-sm transition-colors hover:bg-[var(--surface)] focus:outline-none"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--body)',
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    </div>
  )
}
