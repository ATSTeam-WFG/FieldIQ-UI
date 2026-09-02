import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/lib/context/Providers'
import { Toaster } from '@/components/ui/toaster'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.categoryTitle}`,
  description: BRAND.description,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/images/logo/app_favicon_dark.svg', type: 'image/svg+xml' },
      { url: '/images/logo/app_favicon_dark.png', sizes: '420x420', type: 'image/png' },
    ],
    shortcut: '/images/logo/app_favicon_dark.png',
    apple: [
      { url: '/images/logo/app_favicon_dark.png', sizes: '420x420', type: 'image/png' },
    ],
  },
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
