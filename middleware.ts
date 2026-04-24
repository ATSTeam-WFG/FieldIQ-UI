import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set(['/', '/login', '/signup', '/onboarding', '/coming-soon'])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/coming-soon/')
  ) {
    return NextResponse.next()
  }

  if (!request.cookies.has('fieldiq_has_token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
