'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Save, Upload, Trash2, Loader2, Image } from 'lucide-react'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'

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
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchArticle()
  }, [params.id])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/by-id/${params.id}`)
      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Статья не найдена')
      }

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

  const handleImageUpload = async (e) => {
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
      toast.error('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
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

      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Ошибка сохранения')
      }

      toast.success('Статья сохранена!')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Ошибка: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены что хотите удалить эту статью?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/articles?id=${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Ошибка удаления')
      }

      toast.success('Статья удалена')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  // Вставка изображения в текст
  const handleInsertImage = async (e) => {
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
        const imgName = file.name.replace(/\.[^/.]+$/, '')
        setContent(prev => prev + `\n\n![${imgName}](${data.url})\n\n`)
        toast.success('Изображение добавлено')
      }
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/articles')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-purple-300">Редактирование статьи</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Удалить
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите заголовок статьи"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label>URL (slug)</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-statyi"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Содержание статьи (Markdown)</Label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInsertImage}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      <Image className="h-4 w-4 mr-2" />
                      {uploading ? 'Загрузка...' : 'Добавить фото'}
                    </span>
                  </Button>
                </label>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст статьи в формате Markdown..."
                className="min-h-[400px] bg-slate-800 border-slate-700 font-mono"
              />
              <p className="text-xs text-slate-500">
                Поддерживается Markdown: **жирный**, *курсив*, # Заголовок, - список, ![alt](url) для изображений
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <div>
                <Label>Категория</Label>
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
              </div>

              <div>
                <Label>Статус</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликовано</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <Label>Обложка статьи</Label>
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setCoverImage('')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-500 mb-2" />
                      <span className="text-sm text-slate-500">Загрузить обложку</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
