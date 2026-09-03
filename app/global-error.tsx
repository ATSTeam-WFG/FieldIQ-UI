'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Last resort: catches errors thrown by the root layout itself, which error.tsx
// sits inside and therefore cannot catch. Must render its own <html>/<body>
// because it replaces the whole document. Styles are inline for the same
// reason — the layout that loads globals.css is the thing that failed.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0f0f0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{
            maxWidth: 440, width: '100%', padding: 32, borderRadius: 8,
            backgroundColor: '#171717', borderTop: '2px solid #c4a574',
            border: '1px solid #27272a', borderTopColor: '#c4a574', borderTopWidth: 2,
          }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>
              FieldMT failed to load
            </h1>
            <p style={{ fontSize: 14, color: '#a1a1aa', marginTop: 8, lineHeight: 1.5 }}>
              This has been reported automatically. Reload to try again.
            </p>
            {error.digest && (
              <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 12, fontFamily: 'monospace' }}>
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20, height: 40, width: '100%', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                backgroundColor: '#c4a574', color: '#000', border: 'none',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
