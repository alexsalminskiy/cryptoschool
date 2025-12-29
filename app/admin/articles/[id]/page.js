'use client'

import { useEffect, useState, useRef } from 'react'
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
import { ArrowLeft, Save, Upload, Trash2, Loader2, Image, Bold, Italic, Heading1, Heading2, Heading3, List, Palette, Type, Underline, Strikethrough, Quote, Code, Link2 } from 'lucide-react'
import { translations, categories } from '@/lib/i18n'
import { toast } from 'sonner'

// Цвета для текста
const TEXT_COLORS = [
  { name: 'Красный', color: '#ef4444' },
  { name: 'Оранжевый', color: '#f97316' },
  { name: 'Жёлтый', color: '#eab308' },
  { name: 'Зелёный', color: '#22c55e' },
  { name: 'Голубой', color: '#06b6d4' },
  { name: 'Синий', color: '#3b82f6' },
  { name: 'Фиолетовый', color: '#a855f7' },
  { name: 'Розовый', color: '#ec4899' },
]

// Размеры текста
const TEXT_SIZES = [
  { name: 'Очень большой', size: '2em' },
  { name: 'Большой', size: '1.5em' },
  { name: 'Средний', size: '1.25em' },
  { name: 'Обычный', size: '1em' },
]

export default function EditArticle() {
  const params = useParams()
  const router = useRouter()
  const textareaRef = useRef(null)
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
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)
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

  // Вставка текста в позицию курсора
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent(prev => prev + text)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  // Обёртка выделенного текста
  const wrapSelection = (before, after) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || 'текст'
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end)
    setContent(newContent)
    setTimeout(() => textarea.focus(), 0)
  }

  // Форматирование
  const handleBold = () => wrapSelection('**', '**')
  const handleItalic = () => wrapSelection('*', '*')
  const handleUnderline = () => wrapSelection('<u>', '</u>')
  const handleStrikethrough = () => wrapSelection('~~', '~~')
  const handleH1 = () => insertAtCursor('\n# Заголовок\n')
  const handleH2 = () => insertAtCursor('\n## Заголовок\n')
  const handleH3 = () => insertAtCursor('\n### Заголовок\n')
  const handleList = () => insertAtCursor('\n- Пункт 1\n- Пункт 2\n- Пункт 3\n')
  const handleQuote = () => insertAtCursor('\n> Цитата\n')
  const handleCode = () => wrapSelection('`', '`')
  const handleLink = () => {
    const url = prompt('Введите URL ссылки:')
    if (url) {
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end) || 'текст ссылки'
      const linkText = `[${selectedText}](${url})`
      const newContent = content.substring(0, start) + linkText + content.substring(end)
      setContent(newContent)
      setTimeout(() => textarea.focus(), 0)
    }
  }

  // Цвет текста
  const handleColorSelect = (color) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || 'цветной текст'
    const coloredText = `<span style="color: ${color}">${selectedText}</span>`
    const newContent = content.substring(0, start) + coloredText + content.substring(end)
    setContent(newContent)
    setShowColorPicker(false)
    setTimeout(() => textarea.focus(), 0)
  }

  // Размер текста
  const handleSizeSelect = (size) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || 'текст'
    const sizedText = `<span style="font-size: ${size}">${selectedText}</span>`
    const newContent = content.substring(0, start) + sizedText + content.substring(end)
    setContent(newContent)
    setShowSizePicker(false)
    setTimeout(() => textarea.focus(), 0)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      
      if (data.url) {
        setCoverImage(data.url)
        toast.success('Обложка загружена')
      }
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleInsertImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      
      if (data.url) {
        // Вставляем изображение без названия файла
        insertAtCursor(`\n\n![](${data.url})\n\n`)
        toast.success('Изображение добавлено')
      }
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !category) {
      toast.error('Заполните все обязательные поля')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title: title.trim(),
          slug: slug.trim(),
          category,
          cover_image_url: coverImage || null,
          content_md: content,
          status
        }),
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Ошибка сохранения')
      }

      toast.success('Статья сохранена!')
      router.push('/admin/articles')
    } catch (error) {
      toast.error('Ошибка: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить статью?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/articles?id=${params.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Ошибка удаления')
      toast.success('Статья удалена')
      router.push('/admin/articles')
    } catch (error) {
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  const ToolbarBtn = ({ onClick, icon: Icon, title }) => (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} className="h-8 w-8 p-0" title={title}>
      <Icon className="h-4 w-4" />
    </Button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/articles')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />Назад
          </Button>
          <h1 className="text-2xl font-bold text-purple-300">Редактирование</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Удалить
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label>URL (slug)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              {/* Панель инструментов */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800 rounded-lg border border-slate-700">
                <ToolbarBtn onClick={handleH1} icon={Heading1} title="Заголовок 1" />
                <ToolbarBtn onClick={handleH2} icon={Heading2} title="Заголовок 2" />
                <ToolbarBtn onClick={handleH3} icon={Heading3} title="Заголовок 3" />
                <div className="w-px h-6 bg-slate-600 mx-1" />
                <ToolbarBtn onClick={handleBold} icon={Bold} title="Жирный (B)" />
                <ToolbarBtn onClick={handleItalic} icon={Italic} title="Курсив (I)" />
                <ToolbarBtn onClick={handleUnderline} icon={Underline} title="Подчёркнутый (U)" />
                <ToolbarBtn onClick={handleStrikethrough} icon={Strikethrough} title="Зачёркнутый (S)" />
                <div className="w-px h-6 bg-slate-600 mx-1" />
                <ToolbarBtn onClick={handleList} icon={List} title="Список" />
                <ToolbarBtn onClick={handleQuote} icon={Quote} title="Цитата" />
                <ToolbarBtn onClick={handleCode} icon={Code} title="Код" />
                <ToolbarBtn onClick={handleLink} icon={Link2} title="Ссылка" />
                <div className="w-px h-6 bg-slate-600 mx-1" />
                
                {/* Размер текста */}
                <div className="relative">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false) }} className="h-8 w-8 p-0" title="Размер">
                    <Type className="h-4 w-4" />
                  </Button>
                  {showSizePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-[150px]">
                      {TEXT_SIZES.map((s) => (
                        <button key={s.size} onClick={() => handleSizeSelect(s.size)} className="w-full text-left px-3 py-1.5 hover:bg-slate-700 rounded text-sm">{s.name}</button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Цвет текста */}
                <div className="relative">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false) }} className="h-8 w-8 p-0" title="Цвет">
                    <Palette className="h-4 w-4" />
                  </Button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
                      <div className="flex gap-1">
                        {TEXT_COLORS.map((c) => (
                          <button key={c.color} onClick={() => handleColorSelect(c.color)} className="w-6 h-6 rounded-full hover:scale-110 transition-transform" style={{ backgroundColor: c.color }} title={c.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-px h-6 bg-slate-600 mx-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleInsertImage} className="hidden" />
                  <Button type="button" variant="ghost" size="sm" disabled={uploading} asChild className="h-8 px-2 text-purple-400">
                    <span><Image className="h-4 w-4 mr-1" />{uploading ? '...' : 'Фото'}</span>
                  </Button>
                </label>
              </div>

              <Textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[400px] bg-slate-800 border-slate-700 font-mono" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-purple-900/50 bg-slate-900/50">
            <div className="space-y-4">
              <div>
                <Label>Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (<SelectItem key={cat} value={cat}>{t[cat] || cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
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
              <Label>Обложка</Label>
              {coverImage ? (
                <div className="relative">
                  <img src={coverImage} alt="Cover" className="w-full h-40 object-cover rounded-lg" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setCoverImage('')}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-purple-500">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ? <Loader2 className="h-8 w-8 animate-spin text-purple-500" /> : <><Upload className="h-8 w-8 text-slate-500 mb-2" /><span className="text-sm text-slate-500">Загрузить</span></>}
                </label>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
