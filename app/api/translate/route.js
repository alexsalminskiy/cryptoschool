import { NextResponse } from 'next/server'

// Простой словарь для базового перевода (временное решение)
// В будущем можно подключить внешний API перевода
const basicTranslations = {
  // Базовые фразы для демонстрации
}

// Языковые коды и названия
const LANGUAGES = {
  ru: 'Russian',
  kk: 'Kazakh', 
  en: 'English'
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

    // Используем Google Translate API (бесплатный endpoint)
    const targetLangCode = targetLang === 'kk' ? 'kk' : targetLang
    
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Собираем переведённый текст из ответа Google
        let translatedText = ''
        if (data && data[0]) {
          data[0].forEach(item => {
            if (item[0]) {
              translatedText += item[0]
            }
          })
        }
        
        if (translatedText) {
          return NextResponse.json({ translatedText })
        }
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
