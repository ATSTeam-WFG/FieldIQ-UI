import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.categoryTitle}`,
    short_name: BRAND.name,
    description: BRAND.description,
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
