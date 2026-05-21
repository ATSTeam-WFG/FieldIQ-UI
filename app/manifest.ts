import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FieldIQ — Field Sales Intelligence',
    short_name: 'FieldIQ',
    description: 'AI-powered field sales intelligence for the title insurance industry.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f0f0f',
    theme_color: '#0f0f0f',
    icons: [
      {
        src: '/images/logo/app_favicon_dark.png',
        sizes: '420x420',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo/app_favicon_dark.png',
        sizes: '420x420',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
