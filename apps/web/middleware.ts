import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { accountPaths, supabaseEnabled } from '@/lib/supabase/config'

export async function middleware(request: NextRequest) {
  if (!supabaseEnabled) {
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 })
    }
    if (accountPaths.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone()
      url.pathname = '/paused'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
