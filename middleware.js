import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Защищаем только /admin маршруты
  if (pathname.startsWith('/admin')) {
    // Получаем токен из cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Получаем access token из cookie
    const accessToken = req.cookies.get('sb-xvunmbesvsurmslijlyz-auth-token')?.value
    
    if (!accessToken) {
      // Пробуем получить из localStorage через cookie
      const authCookie = req.cookies.get('supabase.auth.token')?.value
      
      if (!authCookie) {
        // Нет авторизации - редирект на вход
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
    }
    
    // Для более надежной проверки роли, проверка происходит на клиенте
    // Middleware просто проверяет наличие сессии
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}