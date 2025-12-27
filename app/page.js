'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, Shield, TrendingUp } from 'lucide-react'
import { translations } from '@/lib/i18n'

export default function HomePage() {
  const [language] = useState('ru')
  const t = translations[language]

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
                <CardTitle className="text-purple-700 dark:text-purple-300">Bitcoin & Ethereum</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Изучайте основы криптовалют и блокчейн технологий
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <CardTitle className="text-purple-700 dark:text-purple-300">DeFi & Trading</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Освойте децентрализованные финансы и торговые стратегии
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 dark:border-purple-900/50 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                <CardTitle className="text-purple-700 dark:text-purple-300">Security & Wallets</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Защитите свои активы и научитесь безопасности
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
                Получите доступ к эксклюзивным материалам
              </h3>
              <p className="text-muted-foreground text-lg">
                Зарегистрируйтесь, чтобы получить доступ к образовательным статьям, руководствам и аналитике по криптовалютам.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <Link href="/sign-up">
                    Зарегистрироваться
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 rounded-full border-purple-500/50 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                >
                  <Link href="/sign-in">
                    Уже есть аккаунт
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                ℹ️ После регистрации администратор одобрит ваш аккаунт в течение 24 часов
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
