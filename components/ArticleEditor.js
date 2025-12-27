'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link as LinkIcon, Image, Code, Eye, Edit3, Upload } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { toast } from 'sonner'

export default function ArticleEditor({ value, onChange, onImageUpload }) {
  const [previewMode, setPreviewMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Вставка текста в позицию курсора
  const insertAtCursor = useCallback((before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Установка курсора после вставки
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [value, onChange])

  // Обработчики форматирования
  const handleBold = () => insertAtCursor('**', '**')
  const handleItalic = () => insertAtCursor('*', '*')
  const handleH1 = () => insertAtCursor('# ')
  const handleH2 = () => insertAtCursor('## ')
  const handleList = () => insertAtCursor('- ')
  const handleOrderedList = () => insertAtCursor('1. ')
  const handleCode = () => insertAtCursor('`', '`')
  const handleLink = () => insertAtCursor('[текст ссылки](', ')')

  // Загрузка изображения в текст статьи
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUploadInternal = async (e) => {
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
        // Вставляем изображение в markdown
        insertAtCursor(`\n![${file.name}](${data.url})\n`)
        toast.success('Изображение добавлено в статью!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
      // Очищаем input для повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800 rounded-lg border border-slate-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Жирный (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Курсив (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleH1}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Заголовок 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleH2}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Заголовок 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleList}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Маркированный список"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOrderedList}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Нумерованный список"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLink}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Вставить ссылку"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCode}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
          title="Код"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-600 mx-1" />
        
        {/* Кнопка загрузки изображения - ГЛАВНАЯ ФИЧА */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
          disabled={uploading}
          className="h-8 px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 font-medium"
          title="Вставить изображение"
        >
          {uploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
          <span className="ml-1 text-xs">{uploading ? 'Загрузка...' : 'Фото'}</span>
        </Button>
        
        <div className="flex-1" />
        
        {/* Переключатель превью */}
        <Button
          type="button"
          variant={previewMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className={previewMode 
            ? 'h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white' 
            : 'h-8 px-3 text-slate-300 hover:text-white hover:bg-slate-700'
          }
        >
          {previewMode ? (
            <><Edit3 className="h-4 w-4 mr-1" /> Редактор</>
          ) : (
            <><Eye className="h-4 w-4 mr-1" /> Превью</>
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUploadInternal}
        className="hidden"
      />

      {/* Editor / Preview */}
      {previewMode ? (
        <Card className="min-h-[500px] p-6 bg-slate-800 border-slate-700 overflow-auto">
          <div className="prose prose-invert prose-purple max-w-none markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {value || '*Начните писать статью...*'}
            </ReactMarkdown>
          </div>
        </Card>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Начните писать статью...

# Заголовок статьи

Введите текст здесь. Используйте кнопки выше для форматирования.

Нажмите кнопку 'Фото' чтобы вставить изображение в текст."
          className="min-h-[500px] bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm resize-none focus:ring-purple-500 focus:border-purple-500"
        />
      )}

      {/* Help text */}
      <p className="text-xs text-slate-500">
        💡 Поддерживается Markdown: **жирный**, *курсив*, # заголовки, - списки, [ссылки](url), ![изображения](url)
      </p>
    </div>
  )
}
