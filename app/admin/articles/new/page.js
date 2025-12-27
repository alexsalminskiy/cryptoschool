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
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'
import ArticleEditor from '@/components/ArticleEditor'

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const language = 'ru'
  const t = translations[language]

  // Генерация slug из заголовка (только латиница)
  const handleTitleChange = (value) => {
    setTitle(value)
    // Транслитерация для slug
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }
    
    const generatedSlug = value
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    setSlug(generatedSlug)
  }

  // Загрузка обложки
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
      toast.error('Ошибка загрузки: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Сохранение статьи
  const handleSave = async (publishNow = false) => {
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
    toast.info('Сохранение статьи...')
    
    try {
      const articleData = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        cover_image_url: coverImage || null,
        content_md: content,
        status: publishNow ? 'published' : status,
        views: 0
      }

      console.log('Saving article:', articleData)

      // Простой запрос без Promise.race
      const response = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single()

      console.log('Supabase response:', response)

      if (response.error) {
        console.error('Supabase error:', response.error)
        if (response.error.code === '23505' || response.error.message?.includes('duplicate')) {
          toast.error('Статья с таким URL уже существует')
        } else {
          toast.error('Ошибка: ' + response.error.message)
        }
        setSaving(false)
        return
      }

      console.log('Article saved:', response.data)
      toast.success(publishNow ? 'Статья опубликована!' : 'Черновик сохранён')
      
      // Редирект
      router.push('/admin/articles')
      
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Ошибка: ' + (error.message || 'Попробуйте ещё раз'))
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
            className="text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-purple-300">{t.createArticle}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            variant="outline"
            className="border-purple-600 text-purple-300 hover:bg-purple-900/30"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t.saveDraft}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Сохранение...' : t.publish}
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
                  onChange={(e) => handleTitleChange(e.target.value)}
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
            <ArticleEditor value={content} onChange={setContent} />
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
                <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
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
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
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
