import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Simplified - no middleware checks
  // All auth checks happen in client-side layouts
  return NextResponse.next()
}

export const config = {
  matcher: []
}