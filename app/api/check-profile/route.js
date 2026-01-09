import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Создаём клиент с service_role ключом - обходит RLS
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

// GET /api/check-profile?userId=xxx - проверяет профиль пользователя
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Используем admin клиент который обходит RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, approved, first_name, last_name, middle_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile check error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
