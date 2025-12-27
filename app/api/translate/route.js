import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://api.emergentagi.com/v1'
})

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

    const completion = await openai.chat.completions.create({
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

    const translatedText = completion.choices[0]?.message?.content || text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
