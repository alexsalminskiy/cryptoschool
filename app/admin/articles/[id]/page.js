'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Save, Upload, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'
import ArticleEditor from '@/components/ArticleEditor'

export default function EditArticle() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const language = 'ru'
  const t = translations[language]

  useEffect(() => {
    if (params.id) {
      fetchArticle()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setTitle(data.title)
      setSlug(data.slug)
      setCategory(data.category)
      setCoverImage(data.cover_image_url || '')
      setContent(data.content_md || '')
      setStatus(data.status)
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Статья не найдена')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.url) {
        setCoverImage(data.url)
        toast.success('Обложка загружена')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка загрузки: ' + error.message)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleSave = useCallback(async () => {
    // Валидация
    if (!title.trim()) {
      toast.error('Введите заголовок статьи')
      return
    }
    if (!slug.trim()) {
      toast.error('Введите URL статьи')
      return
    }
    if (!category) {
      toast.error('Выберите категорию')
      return
    }
    if (!content.trim()) {
      toast.error('Введите содержание статьи')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        id: params.id,
        title: title.trim(),
        slug: slug.trim(),
        category,
        cover_image_url: coverImage || null,
        content_md: content,
        status
      }

      console.log('Updating article via API:', updateData)

      // Используем API endpoint
      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok || result.error) {
        const errorMsg = result.error || 'Неизвестная ошибка'
        console.error('API error:', errorMsg)
        if (errorMsg.includes('duplicate') || errorMsg.includes('23505')) {
          toast.error('Статья с таким URL уже существует')
        } else {
          toast.error('Ошибка сохранения: ' + errorMsg)
        }
        return
      }

      toast.success('Статья сохранена!')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Ошибка сети: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setSaving(false)
    }
  }, [title, slug, category, coverImage, content, status, params.id, router])

  const handleDelete = useCallback(async () => {
    if (!confirm('Вы уверены что хотите удалить эту статью?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      toast.success('Статья удалена')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-purple-400">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/articles')}
            className="text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-purple-300">{t.editArticle}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/30"
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            {t.delete}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Сохранение...' : t.save}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-purple-300">{t.title} *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите заголовок статьи"
                  className="bg-slate-800 border-slate-700 mt-2 text-white"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-purple-300">{t.slug} *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-statii"
                  className="bg-slate-800 border-slate-700 mt-2 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL: /articles/{slug || 'url-statii'}
                </p>
              </div>
            </div>
          </Card>

          {/* Content Editor */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <Label className="text-purple-300 mb-4 block">{t.content} *</Label>
            <ArticleEditor
              value={content}
              onChange={setContent}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <Label className="text-purple-300 mb-4 block">{t.category} *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Cover Image */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <Label className="text-purple-300 mb-4 block">{t.coverImage}</Label>
            {coverImage ? (
              <div className="space-y-4">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  onClick={() => setCoverImage('')}
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/30"
                >
                  Удалить обложку
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  disabled={uploading}
                  className="w-full border-purple-600 text-purple-300 hover:bg-purple-900/30"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploading ? 'Загрузка...' : t.uploadImage}
                </Button>
              </div>
            )}
          </Card>

          {/* Status */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <Label className="text-purple-300 mb-4 block">{t.status}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t.draft}</SelectItem>
                <SelectItem value="published">{t.published}</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>
    </div>
  )
}
