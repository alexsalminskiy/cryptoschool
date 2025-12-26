import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Get session from cookies
  const authToken = req.cookies.get('supabase.auth.token')
  
  console.log('[Middleware] Path:', req.nextUrl.pathname)
  console.log('[Middleware] Auth token exists:', !!authToken)

  // Protect admin routes - just check if logged in
  // Real role check happens in the layout component
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!authToken) {
      console.log('[Middleware] No auth token, redirecting to sign-in')
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}