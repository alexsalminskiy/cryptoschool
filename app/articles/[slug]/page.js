'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Clock, Tag, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react'
import { translations } from '@/lib/i18n'

// Компонент модального окна для увеличения изображений
function ImageModal({ src, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-50"
      >
        <X className="h-8 w-8" />
      </button>
      <img 
        src={src} 
        alt="" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

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

// Простой парсер markdown с поддержкой HTML
function parseMarkdown(md) {
  if (!md) return ''
  
  // Сначала защитим HTML теги от модификации
  const htmlTags = []
  let processedMd = md.replace(/<span[^>]*>.*?<\/span>/gi, (match) => {
    htmlTags.push(match)
    return `__HTML_TAG_${htmlTags.length - 1}__`
  })
  
  // Защитим <u> теги
  processedMd = processedMd.replace(/<u>(.*?)<\/u>/gi, (match) => {
    htmlTags.push(match)
    return `__HTML_TAG_${htmlTags.length - 1}__`
  })
  
  let html = processedMd
    // Заголовки - чистый стиль как на cryptology.school
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-semibold mt-6 mb-3 text-slate-900 dark:text-slate-100">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4 text-slate-900 dark:text-slate-100">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-5 text-slate-900 dark:text-slate-100">$1</h1>')
    // Жирный и курсив
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Зачёркнутый текст
    .replace(/~~(.+?)~~/g, '<del class="text-slate-500 dark:text-slate-400">$1</del>')
    // Код
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600 dark:text-purple-400">$1</code>')
    // Изображения - с классом для клика
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="rounded-lg w-full cursor-zoom-in hover:opacity-90 transition-opacity article-image" data-zoomable="true" loading="lazy" /></figure>')
    // Ссылки
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Списки
    .replace(/^\- (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-purple-500 mt-1.5 text-xs">●</span><span>$1</span></li>')
    // Цитаты
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-purple-500 bg-slate-50 dark:bg-slate-800/50 pl-4 py-3 my-6 text-slate-600 dark:text-slate-400">$1</blockquote>')
    // Горизонтальная линия
    .replace(/^---$/gm, '<hr class="my-8 border-slate-200 dark:border-slate-700" />')
    // Переносы строк в параграфы
    .replace(/\n\n/g, '</p><p class="mb-4">')

  // Оборачиваем списки
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="mb-4 list-none">$&</ul>')
  
  // Восстанавливаем HTML теги
  htmlTags.forEach((tag, index) => {
    html = html.replace(`__HTML_TAG_${index}__`, tag)
  })
  
  return `<div class="article-text"><p class="mb-4">${html}</p></div>`
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
  const [translatedContent, setTranslatedContent] = useState(null)
  const [translatedTitle, setTranslatedTitle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [currentLang, setCurrentLang] = useState('ru')
  const [zoomedImage, setZoomedImage] = useState(null)
  
  // Обработчик клика по изображениям для увеличения
  useEffect(() => {
    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.dataset.zoomable === 'true') {
        setZoomedImage(e.target.src)
      }
    }
    
    document.addEventListener('click', handleImageClick)
    return () => document.removeEventListener('click', handleImageClick)
  }, [])
  
  // Получаем язык из localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ru'
    setCurrentLang(savedLang)
  }, [])
  
  // Слушаем изменения языка
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('language') || 'ru'
      if (newLang !== currentLang) {
        setCurrentLang(newLang)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Проверяем каждую секунду для обнаружения изменений в той же вкладке
    const interval = setInterval(() => {
      const newLang = localStorage.getItem('language') || 'ru'
      if (newLang !== currentLang) {
        setCurrentLang(newLang)
      }
    }, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentLang])
  
  const t = translations[currentLang] || translations['ru']

  // Расчёт времени чтения
  const readingTime = useMemo(() => {
    const content = translatedContent || article?.content_md
    if (!content) return 0
    const words = content.split(/\s+/).length
    return Math.ceil(words / 200)
  }, [article?.content_md, translatedContent])

  useEffect(() => {
    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])
  
  // Перевод при смене языка
  useEffect(() => {
    if (article && currentLang !== 'ru') {
      translateArticle()
    } else if (currentLang === 'ru') {
      setTranslatedContent(null)
      setTranslatedTitle(null)
    }
  }, [currentLang, article])
  
  const translateArticle = async () => {
    if (!article) return
    
    setTranslating(true)
    try {
      // Переводим заголовок
      const titleResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: article.title, 
          targetLang: currentLang, 
          sourceLang: 'ru' 
        })
      })
      const titleData = await titleResponse.json()
      if (titleData.translatedText) {
        setTranslatedTitle(titleData.translatedText)
      }
      
      // Переводим контент
      const contentResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: article.content_md, 
          targetLang: currentLang, 
          sourceLang: 'ru' 
        })
      })
      const contentData = await contentResponse.json()
      if (contentData.translatedText) {
        setTranslatedContent(contentData.translatedText)
      }
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setTranslating(false)
    }
  }

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

  // Используем переведённый контент если есть
  const displayContent = translatedContent || article.content_md
  const displayTitle = translatedTitle || article.title
  
  const faqs = parseFAQ(displayContent)
  const contentWithoutFAQ = cleanContent(displayContent)
  
  // Тексты для разных языков
  const langTexts = {
    ru: { home: 'Главная', articles: 'Статьи', minRead: 'мин. чтения', faq: 'Часто задаваемые вопросы', allArticles: 'Все статьи', translating: 'Переводим...' },
    en: { home: 'Home', articles: 'Articles', minRead: 'min read', faq: 'Frequently Asked Questions', allArticles: 'All Articles', translating: 'Translating...' },
    kk: { home: 'Басты бет', articles: 'Мақалалар', minRead: 'мин. оқу', faq: 'Жиі қойылатын сұрақтар', allArticles: 'Барлық мақалалар', translating: 'Аударылуда...' }
  }
  const lt = langTexts[currentLang] || langTexts['ru']

  return (
    <div className="min-h-screen">
      {/* Модальное окно для увеличенного изображения */}
      {zoomedImage && (
        <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
      
      {/* Индикатор перевода */}
      {translating && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          {lt.translating}
        </div>
      )}
      
      {/* Hero Section with Cover Image */}
      <div className="relative h-[220px] sm:h-[300px] md:h-[400px] overflow-hidden">
        {article.cover_image_url ? (
          <>
            <img
              src={article.cover_image_url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 overflow-x-auto">
              <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap">{lt.home}</Link>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <Link href="/articles" className="hover:text-foreground transition-colors whitespace-nowrap">{lt.articles}</Link>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-purple-500 dark:text-purple-400 whitespace-nowrap">{t[article.category] || article.category}</span>
            </nav>
            
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4 text-foreground leading-tight">
              {displayTitle}
            </h1>
            
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                {readingTime} {lt.minRead}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                {t[article.category] || article.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <article className="max-w-3xl mx-auto">
          {/* Карточка с контентом для удобного чтения */}
          <div className="bg-amber-50/70 dark:bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 shadow-sm border border-amber-100 dark:border-slate-800">
            {/* Article Body */}
            <div 
              className="article-content font-article text-slate-800 dark:text-slate-200"
              style={{
                fontSize: 'clamp(15px, 4vw, 17px)',
                lineHeight: '1.7',
                fontWeight: '400'
              }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(contentWithoutFAQ) }}
            />
          </div>

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <div className="mt-8 sm:mt-12 bg-amber-50/70 dark:bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 border border-amber-100 dark:border-slate-800">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-slate-100 border-b border-amber-200 dark:border-slate-700 pb-3">
                {lt.faq}
              </h2>
              <div className="space-y-2 sm:space-y-3 font-article">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-purple-500/20">
            <Button
              variant="outline"
              asChild
              className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 h-11"
            >
              <Link href="/articles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {lt.allArticles}
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
