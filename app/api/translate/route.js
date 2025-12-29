import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Функция для перевода одного куска текста
async function translateChunk(text, sourceLang, targetLangCode) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  if (response.ok) {
    const data = await response.json()
    let translatedText = ''
    if (data && data[0]) {
      data[0].forEach(item => {
        if (item[0]) {
          translatedText += item[0]
        }
      })
    }
    return translatedText
  }
  return null
}

// Разбиваем текст на части по параграфам, сохраняя структуру
function splitTextIntoChunks(text, maxChunkSize = 4000) {
  const chunks = []
  const paragraphs = text.split(/(\n\n|\n(?=[#\-\*\[]))/g)
  
  let currentChunk = ''
  
  for (const para of paragraphs) {
    if (!para) continue
    
    if ((currentChunk + para).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk)
      currentChunk = para
    } else {
      currentChunk += para
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

export async function POST(request) {
  try {
    const { text, targetLang, sourceLang = 'ru' } = await request.json()

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 })
    }

    // Если целевой язык совпадает с исходным - возвращаем как есть
    if (targetLang === sourceLang) {
      return NextResponse.json({ translatedText: text })
    }

    const targetLangCode = targetLang === 'kk' ? 'kk' : targetLang
    
    try {
      // Для коротких текстов - простой перевод
      if (text.length < 4000) {
        const translated = await translateChunk(text, sourceLang, targetLangCode)
        if (translated) {
          return NextResponse.json({ translatedText: translated })
        }
      } else {
        // Для длинных текстов - разбиваем на части
        const chunks = splitTextIntoChunks(text, 4000)
        console.log(`Translating ${chunks.length} chunks...`)
        
        const translatedChunks = []
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const translated = await translateChunk(chunk, sourceLang, targetLangCode)
          
          if (translated) {
            translatedChunks.push(translated)
          } else {
            // Если не удалось перевести, оставляем оригинал
            translatedChunks.push(chunk)
          }
          
          // Небольшая задержка между запросами чтобы не получить блокировку
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        const fullTranslation = translatedChunks.join('')
        return NextResponse.json({ translatedText: fullTranslation })
      }
    } catch (googleError) {
      console.error('Google Translate error:', googleError)
    }

    // Если Google Translate не сработал, возвращаем оригинал
    return NextResponse.json({ translatedText: text })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
