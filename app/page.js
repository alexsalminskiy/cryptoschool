'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, Shield, TrendingUp, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'
import { format } from 'date-fns'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchLatestArticles()
  }, [])

  const fetchLatestArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              <span className="neon-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t.heroTitle}
              </span>
            </h1>
            <p className="mb-4 text-xl text-purple-200 md:text-2xl">
              {t.heroSubtitle}
            </p>
            <p className="mb-8 text-lg text-slate-300">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
              >
                <Link href="/articles">
                  {t.getStarted}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-purple-300">Bitcoin & Ethereum</CardTitle>
                <CardDescription className="text-slate-400">
                  Изучайте основы криптовалют и блокчейн технологий
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-purple-300">DeFi & Trading</CardTitle>
                <CardDescription className="text-slate-400">
                  Освойте децентрализованные финансы и торговые стратегии
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-purple-300">Security & Wallets</CardTitle>
                <CardDescription className="text-slate-400">
                  Защитите свои активы и научитесь безопасности
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Articles Preview или CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-purple-300">
              {t.latestArticles}
            </h2>
          </div>

          {/* CTA для неавторизованных пользователей */}
          <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur p-12 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-300">
                Получите доступ к эксклюзивным материалам
              </h3>
              <p className="text-slate-300 text-lg">
                Зарегистрируйтесь, чтобы получить доступ к образовательным статьям, руководствам и аналитике по криптовалютам.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/sign-up">
                    Зарегистрироваться
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-purple-600 text-purple-300"
                >
                  <Link href="/sign-in">
                    Уже есть аккаунт
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                ℹ️ После регистрации администратор одобрит ваш аккаунт в течение 24 часов
              </p>
            </div>
          </Card>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-purple-900/50 bg-slate-900/50 animate-pulse">
                  <div className="h-48 bg-slate-800" />
                  <CardHeader>
                    <div className="h-6 bg-slate-800 rounded" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur p-12 text-center">
              <p className="text-slate-400 text-lg">
                Пока нет опубликованных статей. Скоро появятся!
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-all h-full group">
                    {article.cover_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {article.category}
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-purple-300 group-hover:text-purple-200 transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-slate-400 flex items-center justify-between">
                        <span>{format(new Date(article.created_at), 'dd.MM.yyyy')}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}