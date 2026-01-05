'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Shield, TrendingUp, Sparkles, Zap } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, profile } = useAuth()
  const [language, setLanguage] = useState('ru')
  const [mounted, setMounted] = useState(false)
  
  // Проверяем, авторизован ли пользователь и одобрен
  const isApproved = user && profile?.approved
  
  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('language') || 'ru'
    setLanguage(savedLang)
    
    const interval = setInterval(() => {
      const newLang = localStorage.getItem('language') || 'ru'
      if (newLang !== language) {
        setLanguage(newLang)
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [language])
  
  const t = translations[language] || translations['ru']
  
  const texts = {
    ru: {
      badge: 'Образовательная платформа',
      feature1Title: 'Основы криптовалют',
      feature1Desc: 'Глубокое понимание Bitcoin, Ethereum и технологии блокчейн',
      feature2Title: 'Торговые стратегии',
      feature2Desc: 'DeFi протоколы, спотовая торговля и управление рисками',
      feature3Title: 'Безопасность активов',
      feature3Desc: 'Защита кошельков, приватные ключи и лучшие практики',
      ctaTitle: 'Начните обучение сегодня',
      ctaDesc: 'Присоединяйтесь к тысячам пользователей, которые уже изучают криптовалюты с нами.',
      register: 'Создать аккаунт',
      hasAccount: 'Войти',
      stats1: 'Статей',
      stats2: 'Языков',
      stats3: 'Тем',
      trusted: 'Проверенные материалы'
    },
    en: {
      badge: 'Educational Platform',
      feature1Title: 'Crypto Fundamentals',
      feature1Desc: 'Deep understanding of Bitcoin, Ethereum and blockchain technology',
      feature2Title: 'Trading Strategies',
      feature2Desc: 'DeFi protocols, spot trading and risk management',
      feature3Title: 'Asset Security',
      feature3Desc: 'Wallet protection, private keys and best practices',
      ctaTitle: 'Start learning today',
      ctaDesc: 'Join thousands of users who are already learning crypto with us.',
      register: 'Create account',
      hasAccount: 'Sign in',
      stats1: 'Articles',
      stats2: 'Languages',
      stats3: 'Topics',
      trusted: 'Verified content'
    },
    kk: {
      badge: 'Білім беру платформасы',
      feature1Title: 'Криптовалюта негіздері',
      feature1Desc: 'Bitcoin, Ethereum және блокчейн технологиясын терең түсіну',
      feature2Title: 'Сауда стратегиялары',
      feature2Desc: 'DeFi хаттамалары, спот сауда және тәуекелдерді басқару',
      feature3Title: 'Актив қауіпсіздігі',
      feature3Desc: 'Әмиян қорғау, жеке кілттер және үздік тәжірибелер',
      ctaTitle: 'Бүгін оқуды бастаңыз',
      ctaDesc: 'Бізбен бірге крипто үйреніп жатқан мыңдаған пайдаланушыларға қосылыңыз.',
      register: 'Аккаунт жасау',
      hasAccount: 'Кіру',
      stats1: 'Мақалалар',
      stats2: 'Тілдер',
      stats3: 'Тақырыптар',
      trusted: 'Тексерілген материалдар'
    }
  }
  
  const lt = texts[language] || texts['ru']

  if (!mounted) return null

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-bg">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern" />
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{lt.badge}</span>
            </div>
            
            {/* Title */}
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">
                {t.heroTitle}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mb-4 text-xl sm:text-2xl md:text-3xl font-medium text-foreground/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t.heroSubtitle}
            </p>
            
            {/* Description */}
            <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {t.heroDescription}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button
                size="lg"
                asChild
                className="btn-premium h-14 px-8 text-lg text-white"
              >
                <Link href="/sign-up">
                  {t.getStarted}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="btn-outline-premium h-14 px-8 text-lg"
              >
                <Link href={isApproved ? "/articles" : "/sign-up"}>
                  {t.browseArticles || 'Смотреть статьи'}
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">50+</div>
                <div className="text-sm text-muted-foreground mt-1">{lt.stats1}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">3</div>
                <div className="text-sm text-muted-foreground mt-1">{lt.stats2}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">10+</div>
                <div className="text-sm text-muted-foreground mt-1">{lt.stats3}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        
        <div className="container relative mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.whyChooseUs || 'Почему выбирают нас'}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {lt.trusted}
            </p>
          </div>
          
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="card-premium p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{lt.feature1Title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {lt.feature1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-premium p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{lt.feature2Title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {lt.feature2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-premium p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{lt.feature3Title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {lt.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
            
            <div className="relative glass-card p-10 md:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-8 animate-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {lt.ctaTitle}
              </h2>
              
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                {lt.ctaDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="btn-premium h-14 px-10 text-lg text-white"
                >
                  <Link href="/sign-up">
                    {lt.register}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="btn-outline-premium h-14 px-10 text-lg"
                >
                  <Link href="/sign-in">
                    {lt.hasAccount}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  )
}
