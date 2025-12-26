'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Save, Upload, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('# Заголовок статьи\n\nВведите содержание статьи здесь...')
  const [status, setStatus] = useState('draft')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  // Auto-generate slug from title
  const handleTitleChange = (value) => {
    setTitle(value)
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9а-я]+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(generatedSlug)
  }

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.url) {
        setCoverImage(data.url)
        toast.success('Изображение загружено')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
    }
  }

  // Save article
  const handleSave = async (publishNow = false) => {
    if (!title || !slug || !category || !content) {
      toast.error('Заполните все обязательные поля')
      return
    }

    try {
      setSaving(true)
      
      const { data, error } = await supabase
        .from('articles')
        .insert([{
          title,
          slug,
          category,
          cover_image_url: coverImage,
          content_md: content,
          status: publishNow ? 'published' : status,
          views: 0
        }])
        .select()
        .single()

      if (error) throw error

      toast.success(publishNow ? t.articleCreated : 'Черновик сохранён')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Save error:', error)
      if (error.message.includes('duplicate key')) {
        toast.error('Статья с таким slug уже существует')
      } else {
        toast.error(t.error)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/articles')}
            className="text-purple-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-purple-300">{t.createArticle}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            variant="outline"
            className="border-purple-600 text-purple-300"
          >
            <Save className="mr-2 h-4 w-4" />
            {t.saveDraft}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? t.loading : t.publish}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card className="border-purple-900/50 bg-slate-900/50 p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-purple-300">{t.title} *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Введите заголовок статьи"
                  className="bg-slate-800 border-slate-700 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-purple-300">{t.slug} *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-statii"
                  className="bg-slate-800 border-slate-700 mt-2"
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
            <div data-color-mode="dark">
              <MDEditor
                value={content}
                onChange={setContent}
                height={500}
                preview="edit"
                hideToolbar={false}
                enableScroll={true}
                visibleDragbar={false}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Поддерживается Markdown: заголовки, списки, ссылки, изображения, код, таблицы
            </p>
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
                  className="w-full border-red-600 text-red-400"
                >
                  Удалить
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
                  className="w-full border-purple-600 text-purple-300"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Загрузка...' : t.uploadImage}
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Рекомендуемый размер: 1200x630px
            </p>
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

function useState(initialValue) {
  const [value, setValue] = require('react').useState(initialValue)
  return [value, setValue]
}
