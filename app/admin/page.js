'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Eye, TrendingUp, Clock, Users } from 'lucide-react'
import { translations } from '@/lib/i18n'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalUsers: 0,
    pendingUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      
      if (response.ok && !data.error) {
        setStats(data)
      }
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
      title: t.totalViews,
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-400'
    },
    {
      title: t.totalUsers,
      value: stats.totalUsers,
      icon: Users,
      color: 'text-cyan-400'
    },
    {
      title: t.pendingUsers,
      value: stats.pendingUsers,
      icon: Clock,
      color: 'text-yellow-400',
      highlight: stats.pendingUsers > 0
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">{t.dashboard}</h1>
        <p className="text-slate-400">Статистика платформы Crypto Academy</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((stat, index) => (
            <Card 
              key={index} 
              className={`border-purple-900/50 bg-slate-900/50 backdrop-blur ${
                stat.highlight ? 'ring-2 ring-yellow-500/50' : ''
              }`}
            >
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
                {stat.highlight && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Требуется внимание!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}