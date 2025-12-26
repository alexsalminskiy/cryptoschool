import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect articles - require authentication and approval
  if (req.nextUrl.pathname.startsWith('/articles')) {
    if (!session) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user is approved
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved, role')
      .eq('id', session.user.id)
      .single()

    // Admins always have access
    if (profile?.role !== 'admin') {
      if (!profile?.approved) {
        return NextResponse.redirect(new URL('/pending-approval', req.url))
      }
    }
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/articles/:path*', '/admin/:path*']
}