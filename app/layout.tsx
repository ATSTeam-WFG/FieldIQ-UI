import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/lib/context/Providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'FieldIQ — Field Sales Intelligence',
  description: 'AI-powered field sales intelligence for the title insurance industry.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
