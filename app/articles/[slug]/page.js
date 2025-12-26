'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-slate-800 rounded-lg" />
            <div className="h-12 bg-slate-800 rounded" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-800 rounded" />
              <div className="h-4 bg-slate-800 rounded" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-4xl">
            <Button
              variant="ghost"
              asChild
              className="mb-4 text-purple-300 hover:text-purple-200"
            >
              <Link href="/articles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.allArticles}
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {article.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.created_at), 'dd MMMM yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t[article.category] || article.category}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {article.views} {t.views}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <article className="mx-auto max-w-4xl">
          <div className="prose prose-invert prose-purple max-w-none markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {article.content_md}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}