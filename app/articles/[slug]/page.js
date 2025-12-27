'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Clock, Eye, Tag, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'

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

// Компонент оглавления
function TableOfContents({ headings, activeId }) {
  if (headings.length === 0) return null
  
  return (
    <Card className="sticky top-24 p-4 border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur">
      <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide">
        Содержание
      </h4>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block py-1.5 text-sm transition-colors border-l-2 pl-3 ${
              heading.level === 3 ? 'ml-3' : ''
            } ${
              activeId === heading.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-purple-500/50'
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </Card>
  )
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const language = 'ru'
  const t = translations[language]

  // Расчёт времени чтения
  const readingTime = useMemo(() => {
    if (!article?.content_md) return 0
    const words = article.content_md.split(/\s+/).length
    return Math.ceil(words / 200) // 200 слов в минуту
  }, [article?.content_md])

  useEffect(() => {
    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])

  // Отслеживание активного заголовка при скролле
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

      if (error) throw error

      setArticle(data)

      // Извлекаем заголовки для оглавления
      const headingRegex = /^(#{2,3})\s+(.+)$/gm
      const extractedHeadings = []
      let match
      while ((match = headingRegex.exec(data.content_md)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^a-zа-яё0-9\s]/gi, '')
          .replace(/\s+/g, '-')
        extractedHeadings.push({ level, text, id })
      }
      setHeadings(extractedHeadings)

      // Increment views
      await supabase
        .from('articles')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
    } catch (error) {
      console.error('Error fetching article:', error)
      router.push('/articles')
    } finally {
      setLoading(false)
    }
  }

  // Парсинг FAQ из контента
  const parseFAQ = (content) => {
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

  // Удаляем FAQ блоки из основного контента для отдельного рендеринга
  const cleanContent = (content) => {
    return content.replace(/\[FAQ\][\s\S]*?\[\/FAQ\]/gi, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-muted rounded-2xl" />
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
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
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
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/articles" className="hover:text-foreground transition-colors">Статьи</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-purple-500 dark:text-purple-400">{t[article.category] || article.category}</span>
            </nav>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
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
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                {article.views} просмотров
              </div>
              <div className="text-muted-foreground">
                {format(new Date(article.created_at), 'd MMMM yyyy', { locale: ru })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content with Sidebar */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8 max-w-6xl mx-auto">
          {/* Table of Contents - Desktop */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <TableOfContents headings={headings} activeId={activeId} />
            </aside>
          )}
          
          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-4xl">
            {/* Mobile Table of Contents */}
            {headings.length > 0 && (
              <Card className="lg:hidden mb-8 p-4 border-purple-500/20 dark:border-purple-900/50 bg-card/50">
                <details>
                  <summary className="text-sm font-semibold text-purple-600 dark:text-purple-400 cursor-pointer">
                    📋 Содержание статьи
                  </summary>
                  <nav className="mt-3 space-y-1">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block py-1 text-sm text-muted-foreground hover:text-purple-500 ${
                          heading.level === 3 ? 'ml-4' : ''
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </details>
              </Card>
            )}
            
            {/* Article Body */}
            <div className="prose prose-lg dark:prose-invert prose-purple max-w-none article-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug]}
                components={{
                  // Кастомные компоненты для красивого оформления
                  h2: ({ children, ...props }) => (
                    <h2 
                      {...props} 
                      className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-purple-700 dark:text-purple-300 border-b border-purple-500/20 pb-3"
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 
                      {...props} 
                      className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-600 dark:text-purple-400"
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p {...props} className="mb-6 leading-8 text-foreground/90">
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul {...props} className="mb-6 space-y-2 list-none">
                      {children}
                    </ul>
                  ),
                  li: ({ children, ...props }) => (
                    <li {...props} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1.5">●</span>
                      <span>{children}</span>
                    </li>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol {...props} className="mb-6 space-y-2 list-decimal list-inside">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote 
                      {...props} 
                      className="border-l-4 border-purple-500 bg-purple-500/10 dark:bg-purple-900/20 pl-6 pr-4 py-4 my-6 rounded-r-lg italic"
                    >
                      {children}
                    </blockquote>
                  ),
                  img: ({ src, alt, ...props }) => (
                    <figure className="my-8">
                      <img 
                        src={src} 
                        alt={alt} 
                        className="rounded-xl w-full shadow-lg" 
                        loading="lazy"
                        {...props}
                      />
                      {alt && (
                        <figcaption className="text-center text-sm text-muted-foreground mt-3">
                          {alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="my-8 overflow-x-auto rounded-lg border border-purple-500/20">
                      <table {...props} className="w-full">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead {...props} className="bg-purple-500/10 dark:bg-purple-900/30">
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th {...props} className="px-4 py-3 text-left font-semibold text-purple-700 dark:text-purple-300">
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td {...props} className="px-4 py-3 border-t border-purple-500/10">
                      {children}
                    </td>
                  ),
                  code: ({ inline, children, ...props }) => (
                    inline ? (
                      <code {...props} className="px-2 py-1 bg-muted rounded text-sm text-purple-600 dark:text-purple-400">
                        {children}
                      </code>
                    ) : (
                      <code {...props} className="block">
                        {children}
                      </code>
                    )
                  ),
                  pre: ({ children, ...props }) => (
                    <pre {...props} className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto my-6 text-sm">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href, ...props }) => (
                    <a 
                      href={href} 
                      {...props} 
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-500 underline decoration-purple-500/30 hover:decoration-purple-500 transition-colors"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {contentWithoutFAQ}
              </ReactMarkdown>
            </div>

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-purple-700 dark:text-purple-300 border-b border-purple-500/20 pb-3">
                  ❓ Часто задаваемые вопросы
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
    </div>
  )
}
