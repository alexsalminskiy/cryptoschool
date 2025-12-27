'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Save, Upload, Trash2, Loader2, Image, Send } from 'lucide-react'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'

// Транслитерация для генерации slug
function transliterate(text) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '-',
    'қ': 'q', 'ү': 'u', 'ұ': 'u', 'ә': 'a', 'ө': 'o', 'ғ': 'g', 'і': 'i',
    'ң': 'n', 'һ': 'h'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  // Автогенерация slug из заголовка
  const handleTitleChange = (value) => {
    setTitle(value)
    if (!slug || slug === transliterate(title)) {
      setSlug(transliterate(value))
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

  const handleSave = async (publishNow = false) => {
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
        status: publishNow ? 'published' : status
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        const errorMsg = result.error || 'Неизвестная ошибка'
        if (errorMsg.includes('duplicate') || errorMsg.includes('23505')) {
          toast.error('Статья с таким URL уже существует')
        } else {
          toast.error('Ошибка: ' + errorMsg)
        }
        setSaving(false)
        return
      }

      toast.success(publishNow ? 'Статья опубликована!' : 'Черновик сохранён')
      router.push('/admin/articles')
      
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Ошибка сети: ' + (error.message || 'Попробуйте ещё раз'))
      setSaving(false)
    }
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
          <h1 className="text-2xl font-bold text-purple-300">Новая статья</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить черновик
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Опубликовать
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
                  onChange={(e) => handleTitleChange(e.target.value)}
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
                <p className="text-xs text-slate-500 mt-1">Автоматически генерируется из заголовка</p>
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
                placeholder="Введите текст статьи в формате Markdown...

Примеры форматирования:
# Большой заголовок
## Средний заголовок
### Маленький заголовок

**Жирный текст**
*Курсив*

- Элемент списка
- Еще элемент

[Текст ссылки](https://example.com)
![Описание](url-картинки)"
                className="min-h-[400px] bg-slate-800 border-slate-700 font-mono"
              />
              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Форматирование:</strong></p>
                <p># Заголовок 1 | ## Заголовок 2 | ### Заголовок 3</p>
                <p>**жирный** | *курсив* | - список</p>
                <p>![описание](url) - изображение | [текст](url) - ссылка</p>
              </div>
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
