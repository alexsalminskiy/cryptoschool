'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations, categories } from '@/lib/i18n'
import { format } from 'date-fns'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, searchTerm])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content_md.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {t.allArticles}
          </span>
        </h1>
        <p className="text-slate-400 text-lg">
          Изучайте криптовалюты, DeFi, NFT и блокчейн технологии
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t[cat] || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
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
            {searchTerm || selectedCategory !== 'all'
              ? 'Ничего не найдено. Попробуйте изменить фильтры.'
              : 'Пока нет опубликованных статей.'}
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
                      {t[article.category] || article.category}
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
  )
}