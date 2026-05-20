import Link from 'next/link'

export default function NotFound() {
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
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>404</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
          Page not found
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#000',
            backgroundColor: '#c4a574',
            textDecoration: 'none',
            borderRadius: 6,
            padding: '8px 16px',
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
