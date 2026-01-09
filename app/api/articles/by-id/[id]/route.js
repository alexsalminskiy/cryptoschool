import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Создаём admin клиент
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Отключаем кэширование
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/articles/by-id/[id] - Get article by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    console.log('Fetching article by ID:', id)
    
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
    }

    // Добавляем заголовки против кэширования
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
