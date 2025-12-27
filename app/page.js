'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, Shield, TrendingUp } from 'lucide-react'
import { translations } from '@/lib/i18n'

export default function HomePage() {
  const [language, setLanguage] = useState('ru')
  
  // Получаем язык из localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ru'
    setLanguage(savedLang)
    
    // Слушаем изменения
    const interval = setInterval(() => {
      const newLang = localStorage.getItem('language') || 'ru'
      if (newLang !== language) {
        setLanguage(newLang)
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [language])
  
  const t = translations[language] || translations['ru']
  
  // Тексты для секций на разных языках
  const texts = {
    ru: {
      feature1Title: 'Bitcoin & Ethereum',
      feature1Desc: 'Изучайте основы криптовалют и блокчейн технологий',
      feature2Title: 'DeFi & Trading',
      feature2Desc: 'Освойте децентрализованные финансы и торговые стратегии',
      feature3Title: 'Security & Wallets',
      feature3Desc: 'Защитите свои активы и научитесь безопасности',
      ctaTitle: 'Получите доступ к эксклюзивным материалам',
      ctaDesc: 'Зарегистрируйтесь, чтобы получить доступ к образовательным статьям, руководствам и аналитике по криптовалютам.',
      register: 'Зарегистрироваться',
      hasAccount: 'Уже есть аккаунт',
      approvalNote: 'ℹ️ После регистрации администратор одобрит ваш аккаунт в течение 24 часов'
    },
    en: {
      feature1Title: 'Bitcoin & Ethereum',
      feature1Desc: 'Learn the basics of cryptocurrencies and blockchain technology',
      feature2Title: 'DeFi & Trading',
      feature2Desc: 'Master decentralized finance and trading strategies',
      feature3Title: 'Security & Wallets',
      feature3Desc: 'Protect your assets and learn security best practices',
      ctaTitle: 'Get access to exclusive content',
      ctaDesc: 'Register to get access to educational articles, guides and cryptocurrency analytics.',
      register: 'Register',
      hasAccount: 'Already have an account',
      approvalNote: 'ℹ️ After registration, an administrator will approve your account within 24 hours'
    },
    kk: {
      feature1Title: 'Bitcoin & Ethereum',
      feature1Desc: 'Криптовалюталар мен блокчейн технологияларының негіздерін үйреніңіз',
      feature2Title: 'DeFi & Trading',
      feature2Desc: 'Орталықсыздандырылған қаржы және сауда стратегияларын меңгеріңіз',
      feature3Title: 'Security & Wallets',
      feature3Desc: 'Активтеріңізді қорғаңыз және қауіпсіздікті үйреніңіз',
      ctaTitle: 'Эксклюзивті материалдарға қол жеткізіңіз',
      ctaDesc: 'Білім беру мақалаларына, нұсқаулықтарға және криптовалюта талдауларына қол жеткізу үшін тіркеліңіз.',
      register: 'Тіркелу',
      hasAccount: 'Аккаунт бар',
      approvalNote: 'ℹ️ Тіркелгеннен кейін әкімші сіздің аккаунтыңызды 24 сағат ішінде мақұлдайды'
    }
  }
  
  const lt = texts[language] || texts['ru']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 dark:from-purple-900/20 dark:to-pink-900/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              <span className="neon-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t.heroTitle}
              </span>
            </h1>
            <p className="mb-4 text-xl text-purple-700 dark:text-purple-200 md:text-2xl font-medium">
              {t.heroSubtitle}
            </p>
            <p className="mb-8 text-lg text-muted-foreground">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              >
                <Link href="/sign-up">
                  {t.getStarted}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <CardTitle className="text-purple-700 dark:text-purple-300">{lt.feature1Title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {lt.feature1Desc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <CardTitle className="text-purple-700 dark:text-purple-300">{lt.feature2Title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {lt.feature2Desc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <CardTitle className="text-purple-700 dark:text-purple-300">{lt.feature3Title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {lt.feature3Desc}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur p-8 md:p-12 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {lt.ctaTitle}
              </h3>
              <p className="text-muted-foreground text-lg">
                {lt.ctaDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <Link href="/sign-up">
                    {lt.register}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 rounded-full border-purple-500/50 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                >
                  <Link href="/sign-in">
                    {lt.hasAccount}
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {lt.approvalNote}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
