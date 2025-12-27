'use client'

import { useState, useCallback } from 'react'

// Кэш переводов в памяти
const translationCache = new Map()

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false)

  const translateText = useCallback(async (text, targetLang, sourceLang = 'ru') => {
    // Если целевой язык совпадает с исходным - возвращаем как есть
    if (targetLang === sourceLang || !text) {
      return text
    }

    // Проверяем кэш
    const cacheKey = `${sourceLang}_${targetLang}_${text.substring(0, 100)}`
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang })
      })

      const data = await response.json()
      
      if (data.translatedText) {
        // Сохраняем в кэш
        translationCache.set(cacheKey, data.translatedText)
        return data.translatedText
      }
      
      return text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    } finally {
      setIsTranslating(false)
    }
  }, [])

  // Очистка кэша
  const clearCache = useCallback(() => {
    translationCache.clear()
  }, [])

  return {
    translateText,
    isTranslating,
    clearCache
  }
}
