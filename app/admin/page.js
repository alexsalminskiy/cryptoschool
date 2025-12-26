'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Eye, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')

      if (error) throw error

      const totalArticles = articles.length
      const publishedArticles = articles.filter(a => a.status === 'published').length
      const draftArticles = articles.filter(a => a.status === 'draft').length
      const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)

      setStats({
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: t.totalArticles,
      value: stats.totalArticles,
      icon: FileText,
      color: 'text-blue-400'
    },
    {
      title: t.published,
      value: stats.publishedArticles,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: t.draft,
      value: stats.draftArticles,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      title: t.totalViews,
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-400'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">{t.dashboard}</h1>
        <p className="text-slate-400">Статистика платформы</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-purple-900/50 bg-slate-900/50 animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function useState(initialValue) {
  const [value, setValue] = require('react').useState(initialValue)
  return [value, setValue]
}