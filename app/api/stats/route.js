import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Отключаем кэширование
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    // Fetch articles stats
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('status, views')

    if (articlesError) {
      console.error('Articles error:', articlesError)
      return NextResponse.json({ error: articlesError.message }, { status: 500 })
    }

    const totalArticles = articles?.length || 0
    const publishedArticles = articles?.filter(a => a.status === 'published').length || 0
    const draftArticles = articles?.filter(a => a.status === 'draft').length || 0
    const totalViews = articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0

    // Fetch users stats
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('approved, role')

    if (usersError) {
      console.error('Users error:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const totalUsers = users?.length || 0
    const pendingUsers = users?.filter(u => !u.approved && u.role !== 'admin').length || 0

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalUsers,
      pendingUsers
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
