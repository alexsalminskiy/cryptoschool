'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, 
  Link as LinkIcon, Image, Code, Eye, Edit3, Upload, Quote, Table, 
  HelpCircle, Minus
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { toast } from 'sonner'

export default function ArticleEditor({ value, onChange }) {
  const [previewMode, setPreviewMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Вставка текста в позицию курсора
  const insertAtCursor = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholder
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Установка курсора после вставки
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [value, onChange])

  // Обработчики форматирования
  const handleBold = () => insertAtCursor('**', '**', 'жирный текст')
  const handleItalic = () => insertAtCursor('*', '*', 'курсив')
  const handleH1 = () => insertAtCursor('# ', '', 'Заголовок 1')
  const handleH2 = () => insertAtCursor('## ', '', 'Заголовок 2')
  const handleH3 = () => insertAtCursor('### ', '', 'Заголовок 3')
  const handleList = () => insertAtCursor('- ', '', 'Элемент списка')
  const handleOrderedList = () => insertAtCursor('1. ', '', 'Элемент списка')
  const handleCode = () => insertAtCursor('`', '`', 'код')
  const handleLink = () => insertAtCursor('[', '](https://)', 'текст ссылки')
  const handleQuote = () => insertAtCursor('> ', '', 'Цитата')
  const handleDivider = () => insertAtCursor('\n---\n')
  
  // Вставка таблицы
  const handleTable = () => {
    const table = `
| Столбец 1 | Столбец 2 | Столбец 3 |
|-----------|-----------|----------|
| Данные 1  | Данные 2  | Данные 3 |
| Данные 4  | Данные 5  | Данные 6 |
`
    insertAtCursor(table)
  }
  
  // Вставка FAQ блока
  const handleFAQ = () => {
    const faq = `
[FAQ]
[Q]Ваш вопрос здесь?[/Q]
[A]Ваш ответ здесь.[/A]

[Q]Второй вопрос?[/Q]
[A]Второй ответ.[/A]
[/FAQ]
`
    insertAtCursor(faq)
  }

  // Загрузка изображения в текст статьи
  const handleImageClick = () => {
    fileInputRef.current?.click()
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
        // Вставляем изображение в markdown
        const imgName = file.name.replace(/\.[^/.]+$/, '')
        insertAtCursor(`\n![${imgName}](${data.url})\n`)
        toast.success('Изображение добавлено!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Группа кнопок
  const ToolbarButton = ({ onClick, icon: Icon, title, highlight, disabled }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`h-9 w-9 p-0 transition-colors ${
        highlight 
          ? 'text-purple-500 hover:text-purple-400 hover:bg-purple-500/20' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )

  const Divider = () => <div className="w-px h-6 bg-border mx-1" />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 rounded-lg border border-border">
        {/* Заголовки */}
        <ToolbarButton onClick={handleH1} icon={Heading1} title="Заголовок 1" />
        <ToolbarButton onClick={handleH2} icon={Heading2} title="Заголовок 2" />
        <ToolbarButton onClick={handleH3} icon={Heading3} title="Заголовок 3" />
        
        <Divider />
        
        {/* Форматирование текста */}
        <ToolbarButton onClick={handleBold} icon={Bold} title="Жирный (Ctrl+B)" />
        <ToolbarButton onClick={handleItalic} icon={Italic} title="Курсив (Ctrl+I)" />
        <ToolbarButton onClick={handleQuote} icon={Quote} title="Цитата" />
        <ToolbarButton onClick={handleCode} icon={Code} title="Код" />
        
        <Divider />
        
        {/* Списки */}
        <ToolbarButton onClick={handleList} icon={List} title="Маркированный список" />
        <ToolbarButton onClick={handleOrderedList} icon={ListOrdered} title="Нумерованный список" />
        
        <Divider />
        
        {/* Вставки */}
        <ToolbarButton onClick={handleLink} icon={LinkIcon} title="Ссылка" />
        <ToolbarButton onClick={handleTable} icon={Table} title="Таблица" />
        <ToolbarButton onClick={handleDivider} icon={Minus} title="Разделитель" />
        
        <Divider />
        
        {/* Специальные блоки */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
          disabled={uploading}
          className="h-9 px-3 text-purple-500 hover:text-purple-400 hover:bg-purple-500/20 font-medium gap-1.5"
          title="Вставить изображение"
        >
          {uploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
          <span className="text-xs">{uploading ? 'Загрузка...' : 'Фото'}</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFAQ}
          className="h-9 px-3 text-amber-500 hover:text-amber-400 hover:bg-amber-500/20 font-medium gap-1.5"
          title="Вставить FAQ блок"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">FAQ</span>
        </Button>
        
        <div className="flex-1" />
        
        {/* Превью */}
        <Button
          type="button"
          variant={previewMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className={`h-9 px-3 gap-1.5 ${
            previewMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {previewMode ? (
            <><Edit3 className="h-4 w-4" /> Редактор</>
          ) : (
            <><Eye className="h-4 w-4" /> Превью</>
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor / Preview */}
      {previewMode ? (
        <Card className="min-h-[500px] p-6 bg-card border-border overflow-auto">
          <div className="prose prose-lg dark:prose-invert prose-purple max-w-none">
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
          placeholder={`Начните писать статью...

## Используйте заголовки для структуры

Пишите текст здесь. Используйте кнопки панели инструментов для форматирования.

### Подзаголовок

- Список пунктов
- Ещё один пункт

> Цитата выделяется отступом

Нажмите кнопку "Фото" чтобы вставить изображение.
Нажмите "FAQ" чтобы добавить раздел вопросов и ответов.`}
          className="min-h-[500px] bg-card border-border text-foreground font-mono text-sm resize-none focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
        />
      )}

      {/* Help text */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>💡 **жирный**</span>
        <span>*курсив*</span>
        <span>## заголовок</span>
        <span>- список</span>
        <span>[ссылка](url)</span>
        <span>![картинка](url)</span>
        <span>&gt; цитата</span>
      </div>
    </div>
  )
}
