import { NextRequest, NextResponse } from 'next/server'
import { PRESENCE_COOKIE } from '@/lib/storage-keys'

const PUBLIC_PATHS = new Set(['/', '/login', '/signup', '/onboarding', '/coming-soon', '/manifest.webmanifest'])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/coming-soon/') ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/join/')
  ) {
    return NextResponse.next()
  }

  if (!request.cookies.has(PRESENCE_COOKIE)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
