'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, 
  Link as LinkIcon, Image, Code, Eye, Edit3, Upload, Quote, Table, 
  HelpCircle, Minus, Plus, Trash2, X, Palette, Type
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { toast } from 'sonner'

// Цвета для текста
const TEXT_COLORS = [
  { name: 'Красный', color: '#ef4444', class: 'bg-red-500' },
  { name: 'Оранжевый', color: '#f97316', class: 'bg-orange-500' },
  { name: 'Жёлтый', color: '#eab308', class: 'bg-yellow-500' },
  { name: 'Зелёный', color: '#22c55e', class: 'bg-green-500' },
  { name: 'Голубой', color: '#06b6d4', class: 'bg-cyan-500' },
  { name: 'Синий', color: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Фиолетовый', color: '#a855f7', class: 'bg-purple-500' },
  { name: 'Розовый', color: '#ec4899', class: 'bg-pink-500' },
]

// Модальное окно для цвета
function ColorModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-card border border-border rounded-lg shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">Выберите цвет:</p>
      <div className="flex gap-2">
        {TEXT_COLORS.map((c) => (
          <button
            key={c.color}
            onClick={() => { onSelect(c.color); onClose(); }}
            className={`w-6 h-6 rounded-full ${c.class} hover:scale-110 transition-transform`}
            title={c.name}
          />
        ))}
      </div>
    </div>
  )
}

// Модальное окно для FAQ
function FAQModal({ isOpen, onClose, onInsert }) {
  const [questions, setQuestions] = useState([{ q: '', a: '' }])

  const addQuestion = () => {
    setQuestions([...questions, { q: '', a: '' }])
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const handleInsert = () => {
    // Фильтруем пустые вопросы
    const validQuestions = questions.filter(q => q.q.trim() && q.a.trim())
    if (validQuestions.length === 0) {
      toast.error('Добавьте хотя бы один вопрос и ответ')
      return
    }

    // Генерируем FAQ блок
    let faqText = '\n[FAQ]\n'
    validQuestions.forEach(item => {
      faqText += `[Q]${item.q}[/Q]\n[A]${item.a}[/A]\n\n`
    })
    faqText += '[/FAQ]\n'

    onInsert(faqText)
    setQuestions([{ q: '', a: '' }])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4 p-6 bg-card border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-purple-500">Добавить FAQ</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((item, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-500">Вопрос {index + 1}</span>
                {questions.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-400 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Введите вопрос..."
                value={item.q}
                onChange={(e) => updateQuestion(index, 'q', e.target.value)}
                className="bg-background"
              />
              <Textarea
                placeholder="Введите ответ..."
                value={item.a}
                onChange={(e) => updateQuestion(index, 'a', e.target.value)}
                className="bg-background min-h-[80px]"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={addQuestion}
            className="flex-1 border-purple-500/50 text-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить вопрос
          </Button>
          <Button 
            onClick={handleInsert}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Вставить в статью
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Модальное окно для таблицы
function TableModal({ isOpen, onClose, onInsert }) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)

  const handleInsert = () => {
    let table = '\n'
    // Заголовки
    table += '| ' + Array(cols).fill('Заголовок').map((h, i) => `${h} ${i+1}`).join(' | ') + ' |\n'
    // Разделитель
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n'
    // Строки
    for (let r = 0; r < rows - 1; r++) {
      table += '| ' + Array(cols).fill('Данные').join(' | ') + ' |\n'
    }
    table += '\n'

    onInsert(table)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm m-4 p-6 bg-card border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-purple-500">Вставить таблицу</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Столбцов: {cols}</label>
            <input 
              type="range" 
              min="2" 
              max="6" 
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Строк: {rows}</label>
            <input 
              type="range" 
              min="2" 
              max="10" 
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <Button 
          onClick={handleInsert}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
        >
          Вставить таблицу {cols}×{rows}
        </Button>
      </Card>
    </div>
  )
}

export default function ArticleEditor({ value, onChange }) {
  const [previewMode, setPreviewMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showFAQModal, setShowFAQModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Вставка текста в позицию курсора
  const insertAtCursor = useCallback((text) => {
    const textarea = textareaRef.current
    if (!textarea) {
      onChange((value || '') + text)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = value.substring(0, start) + text + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + text.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [value, onChange])

  // Обёртка выделенного текста
  const wrapSelection = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholder
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [value, onChange])

  // Обработчики форматирования
  const handleBold = () => wrapSelection('**', '**', 'жирный текст')
  const handleItalic = () => wrapSelection('*', '*', 'курсив')
  const handleH1 = () => { insertAtCursor('\n# Заголовок\n'); setShowHeadingMenu(false) }
  const handleH2 = () => { insertAtCursor('\n## Заголовок раздела\n'); setShowHeadingMenu(false) }
  const handleH3 = () => { insertAtCursor('\n### Подзаголовок\n'); setShowHeadingMenu(false) }
  const handleH4 = () => { insertAtCursor('\n#### Маленький заголовок\n'); setShowHeadingMenu(false) }
  const handleList = () => insertAtCursor('\n- Пункт 1\n- Пункт 2\n- Пункт 3\n')
  const handleOrderedList = () => insertAtCursor('\n1. Первый\n2. Второй\n3. Третий\n')
  const handleCode = () => wrapSelection('`', '`', 'код')
  const handleLink = () => wrapSelection('[', '](https://)', 'текст ссылки')
  const handleQuote = () => insertAtCursor('\n> Цитата или важная информация\n')
  const handleDivider = () => insertAtCursor('\n---\n')
  
  // Вставка цветного текста
  const handleColorSelect = (color) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || 'цветной текст'
    const coloredText = `<span style="color: ${color}">${selectedText}</span>`
    const newText = value.substring(0, start) + coloredText + value.substring(end)
    
    onChange(newText)
    setShowColorPicker(false)
  }

  // Загрузка изображения
  const handleImageClick = () => fileInputRef.current?.click()

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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Кнопка панели инструментов
  const ToolbarButton = ({ onClick, icon: Icon, title, className = '' }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted ${className}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )

  const Divider = () => <div className="w-px h-6 bg-border mx-1" />

  return (
    <div className="space-y-4">
      {/* Панель инструментов */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 rounded-lg border border-border">
        {/* Заголовки с выпадающим меню */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
            title="Заголовки"
          >
            <Type className="h-4 w-4" />
            <span className="text-xs">Заголовок</span>
          </Button>
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-card border border-border rounded-lg shadow-xl min-w-[160px]">
              <button onClick={handleH1} className="w-full text-left px-3 py-2 text-xl font-bold hover:bg-muted rounded">
                H1 - Большой
              </button>
              <button onClick={handleH2} className="w-full text-left px-3 py-2 text-lg font-bold hover:bg-muted rounded">
                H2 - Средний
              </button>
              <button onClick={handleH3} className="w-full text-left px-3 py-2 text-base font-semibold hover:bg-muted rounded">
                H3 - Маленький
              </button>
              <button onClick={handleH4} className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-muted rounded">
                H4 - Мини
              </button>
            </div>
          )}
        </div>
        
        <Divider />
        
        <ToolbarButton onClick={handleBold} icon={Bold} title="Жирный" />
        <ToolbarButton onClick={handleItalic} icon={Italic} title="Курсив" />
        
        {/* Цвет текста */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Цвет текста"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <ColorModal 
            isOpen={showColorPicker} 
            onClose={() => setShowColorPicker(false)}
            onSelect={handleColorSelect}
          />
        </div>
        
        <ToolbarButton onClick={handleQuote} icon={Quote} title="Цитата" />
        <ToolbarButton onClick={handleCode} icon={Code} title="Код" />
        
        <Divider />
        
        <ToolbarButton onClick={handleList} icon={List} title="Список" />
        <ToolbarButton onClick={handleOrderedList} icon={ListOrdered} title="Нумерованный список" />
        <ToolbarButton onClick={handleLink} icon={LinkIcon} title="Ссылка" />
        <ToolbarButton onClick={handleDivider} icon={Minus} title="Разделитель" />
        
        <Divider />
        
        {/* Специальные кнопки */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
          disabled={uploading}
          className="h-9 px-3 text-purple-500 hover:text-purple-400 hover:bg-purple-500/20 gap-1.5"
        >
          {uploading ? <Upload className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          <span className="text-xs hidden sm:inline">{uploading ? 'Загрузка...' : 'Фото'}</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTableModal(true)}
          className="h-9 px-3 text-blue-500 hover:text-blue-400 hover:bg-blue-500/20 gap-1.5"
        >
          <Table className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Таблица</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowFAQModal(true)}
          className="h-9 px-3 text-amber-500 hover:text-amber-400 hover:bg-amber-500/20 gap-1.5"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">FAQ</span>
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
          {previewMode ? <><Edit3 className="h-4 w-4" /> Редактор</> : <><Eye className="h-4 w-4" /> Превью</>}
        </Button>
      </div>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Редактор / Превью */}
      {previewMode ? (
        <Card className="min-h-[500px] p-6 bg-card border-border overflow-auto">
          <div className="prose prose-lg dark:prose-invert prose-purple max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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

Используйте кнопки выше для форматирования.

📷 Фото - загрузить изображение
📊 Таблица - вставить таблицу  
❓ FAQ - добавить вопросы и ответы"
          className="min-h-[500px] bg-card border-border text-foreground font-mono text-sm resize-none focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
        />
      )}

      {/* Модальные окна */}
      <FAQModal 
        isOpen={showFAQModal} 
        onClose={() => setShowFAQModal(false)} 
        onInsert={insertAtCursor}
      />
      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsert={insertAtCursor}
      />
    </div>
  )
}
