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

// GET /api/articles/[slug] - Get article by slug and increment views
export async function GET(request, { params }) {
  try {
    const { slug } = params
    
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Increment views
    await supabaseAdmin
      .from('articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}