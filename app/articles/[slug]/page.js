'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Clock, Eye, Tag, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { translations } from '@/lib/i18n'

// Компонент для FAQ секции
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-purple-500/20 dark:border-purple-900/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <span className="font-medium text-foreground">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-purple-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-muted/30 border-t border-purple-500/20">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  )
}

// Простой парсер markdown
function parseMarkdown(md) {
  if (!md) return ''
  
  let html = md
    // Заголовки
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4 text-purple-600 dark:text-purple-400">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-purple-700 dark:text-purple-300 border-b border-purple-500/20 pb-2">$1</h2>')
    // Жирный и курсив
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Изображения
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="rounded-xl w-full shadow-lg" loading="lazy" /><figcaption class="text-center text-sm text-muted-foreground mt-2">$1</figcaption></figure>')
    // Ссылки
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Списки
    .replace(/^\- (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-purple-500 mt-1">●</span><span>$1</span></li>')
    // Цитаты
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-purple-500 bg-purple-500/10 pl-4 py-2 my-4 italic">$1</blockquote>')
    // Параграфы
    .replace(/\n\n/g, '</p><p class="mb-4 leading-7">')

  // Оборачиваем списки
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="mb-4 list-none">$&</ul>')
  
  return `<p class="mb-4 leading-7">${html}</p>`
}

// Форматирование даты
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const language = 'ru'
  const t = translations[language]

  // Расчёт времени чтения
  const readingTime = useMemo(() => {
    if (!article?.content_md) return 0
    const words = article.content_md.split(/\s+/).length
    return Math.ceil(words / 200)
  }, [article?.content_md])

  useEffect(() => {
    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.slug}`)
      const data = await response.json()
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Статья не найдена')
      }
      
      setArticle(data)
    } catch (error) {
      console.error('Error fetching article:', error)
      router.push('/articles')
    } finally {
      setLoading(false)
    }
  }

  // Парсинг FAQ из контента
  const parseFAQ = (content) => {
    if (!content) return []
    const faqRegex = /\[FAQ\]([\s\S]*?)\[\/FAQ\]/gi
    const faqMatch = content.match(faqRegex)
    if (!faqMatch) return []
    
    const faqs = []
    const qaPairs = faqMatch[0].match(/\[Q\](.+?)\[\/Q\]\s*\[A\]([\s\S]*?)\[\/A\]/gi)
    if (qaPairs) {
      qaPairs.forEach(pair => {
        const qMatch = pair.match(/\[Q\](.+?)\[\/Q\]/i)
        const aMatch = pair.match(/\[A\]([\s\S]*?)\[\/A\]/i)
        if (qMatch && aMatch) {
          faqs.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() })
        }
      })
    }
    return faqs
  }

  // Удаляем FAQ блоки из основного контента
  const cleanContent = (content) => {
    if (!content) return ''
    return content.replace(/\[FAQ\][\s\S]*?\[\/FAQ\]/gi, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-muted rounded-2xl" />
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  const faqs = parseFAQ(article.content_md)
  const contentWithoutFAQ = cleanContent(article.content_md)

  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover Image */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {article.cover_image_url ? (
          <>
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/articles" className="hover:text-foreground transition-colors">Статьи</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-purple-500 dark:text-purple-400">{t[article.category] || article.category}</span>
            </nav>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                {readingTime} мин. чтения
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-500" />
                {t[article.category] || article.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
          {/* Article Body */}
          <div 
            className="prose prose-lg dark:prose-invert prose-purple max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(contentWithoutFAQ) }}
          />

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-purple-700 dark:text-purple-300 border-b border-purple-500/20 pb-3">
                Часто задаваемые вопросы
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-purple-500/20">
            <Button
              variant="outline"
              asChild
              className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            >
              <Link href="/articles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Все статьи
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
