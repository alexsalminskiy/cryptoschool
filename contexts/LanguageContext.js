'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  // Возвращаем значения по умолчанию если контекст не доступен
  if (!context) {
    return {
      language: 'ru',
      setLanguage: () => {},
      mounted: false
    }
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Загружаем сохранённый язык
    const saved = localStorage.getItem('language')
    if (saved && ['ru', 'en', 'kk'].includes(saved)) {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const value = {
    language,
    setLanguage,
    mounted
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
