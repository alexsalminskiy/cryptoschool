import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Защита админ-панели - проверка на клиенте в AdminLayout
  // Middleware только для логирования
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}