import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Поддерживаемые форматы изображений
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif',
  'image/avif'
]

// Максимальный размер файла: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// POST /api/upload - Upload image to Supabase Storage
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 })
    }

    // Проверка типа файла
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Неподдерживаемый формат изображения. Поддерживаются: JPG, PNG, GIF, WEBP, SVG, BMP, TIFF, HEIC, AVIF' 
      }, { status: 400 })
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'Файл слишком большой. Максимальный размер: 10MB' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop().toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
        cacheControl: '3600'
      })

    if (error) {
      return NextResponse.json({ 
        error: `Ошибка загрузки: ${error.message}` 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    return NextResponse.json({ 
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    return NextResponse.json({ 
      error: `Внутренняя ошибка сервера: ${error.message}` 
    }, { status: 500 })
  }
}
