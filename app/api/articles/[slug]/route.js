import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/articles/[slug] - Get article by slug and increment views
export async function GET(request, { params }) {
  try {
    const { slug } = params
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Increment views
    await supabase
      .from('articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}