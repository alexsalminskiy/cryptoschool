import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/articles/by-id/[id] - Get article by ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const { data, error } = await supabase
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

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
