'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ArrowRight, Clock, Loader2 } from 'lucide-react'
import { translations, categories } from '@/lib/i18n'
import { useAuth } from '@/contexts/AuthContext'

export default function ArticlesPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [language] = useState('ru')
  const t = translations[language]

  // Проверка авторизации
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Не авторизован - редирект на вход
        router.push('/sign-in')
      } else if (profile !== null && profile.approved === false) {
        // Авторизован, но не одобрен - редирект на страницу ожидания
        router.push('/pending-approval')
      }
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (user && profile?.approved) {
      fetchArticles()
    }
  }, [selectedCategory, user, profile])

  // Поиск с задержкой (debounce)
  useEffect(() => {
    // Не запускаем поиск если пользователь не авторизован или не одобрен
    if (!user || !profile?.approved) return
    
    const timer = setTimeout(() => {
      fetchArticles()
    }, 500) // Увеличил задержку до 500мс
    
    return () => clearTimeout(timer)
  }, [searchTerm]) // Убрал user и profile из зависимостей

  const fetchArticles = async () => {
    try {
      setLoading(true)
      
      let url = '/api/articles?'
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`
      }
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setArticles(data)
      } else {
        setArticles([])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
  }

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading || !user || !profile?.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative py-16 md:py-24 hero-bg">
        <div className="absolute inset-0 grid-pattern" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              <span className="gradient-text">
                {selectedCategory === 'all' ? t.allArticles : t[selectedCategory] || selectedCategory}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {selectedCategory === 'all' 
                ? 'Изучайте криптовалюты, DeFi, NFT и блокчейн технологии'
                : `Статьи по теме: ${t[selectedCategory] || selectedCategory}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl input-premium"
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[220px] h-12 rounded-xl input-premium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">{t.allCategories}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="rounded-lg">
                  {t[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-premium overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-muted rounded-lg animate-pulse mb-3" />
                  <div className="h-4 bg-muted rounded-lg animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="glass-card p-12 md:p-16 text-center">
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory !== 'all'
                ? 'Ничего не найдено. Попробуйте изменить фильтры.'
                : 'Пока нет опубликованных статей.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.slug}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <article className="card-premium h-full overflow-hidden">
                  {article.cover_image_url && (
                    <div className="relative h-48 md:h-52 overflow-hidden">
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-500/90 text-white">
                          {t[article.category] || article.category}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-violet-500 transition-colors">
                      {article.title}
                    </h2>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{Math.ceil((article.content_md?.length || 0) / 1500)} мин</span>
                      </div>
                      <span className="flex items-center gap-1 text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Читать <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
