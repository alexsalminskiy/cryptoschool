import { NextResponse } from 'next/server'

// Языковые коды и названия
const LANGUAGES = {
  ru: 'русский',
  kk: 'казахский',
  en: 'английский'
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

    const targetLangName = LANGUAGES[targetLang] || targetLang
    const sourceLangName = LANGUAGES[sourceLang] || sourceLang

    const response = await fetch('https://api.emergentagi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты профессиональный переводчик. Переводи текст с ${sourceLangName} на ${targetLangName}. 
Сохраняй форматирование markdown (заголовки #, ##, ###, жирный текст **, курсив *, списки -, ссылки [], изображения ![]). 
Не добавляй никаких комментариев, только перевод.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error:', errorData)
      return NextResponse.json({ error: 'Translation API error' }, { status: 500 })
    }

    const data = await response.json()
    const translatedText = data.choices?.[0]?.message?.content || text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
