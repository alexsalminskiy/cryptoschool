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
    console.log('[Upload] Starting upload...')
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      console.error('[Upload] No file provided')
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 })
    }

    console.log('[Upload] File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Проверка типа файла
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      console.error('[Upload] Unsupported file type:', file.type)
      return NextResponse.json({ 
        error: `Неподдерживаемый формат изображения. Поддерживаются: JPG, PNG, GIF, WEBP, SVG, BMP, TIFF, HEIC, AVIF` 
      }, { status: 400 })
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      console.error('[Upload] File too large:', file.size)
      return NextResponse.json({ 
        error: `Файл слишком большой. Максимальный размер: 10MB` 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop().toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    console.log('[Upload] Generated filename:', fileName)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('[Upload] Uploading to Supabase Storage...')

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
        cacheControl: '3600'
      })

    if (error) {
      console.error('[Upload] Supabase error:', error)
      return NextResponse.json({ 
        error: `Ошибка загрузки: ${error.message}` 
      }, { status: 500 })
    }

    console.log('[Upload] Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    console.log('[Upload] Public URL:', publicUrl)

    return NextResponse.json({ 
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json({ 
      error: `Внутренняя ошибка сервера: ${error.message}` 
    }, { status: 500 })
  }
}