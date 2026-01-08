'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { translations } from '@/lib/i18n'
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const t = translations.ru

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Пользователь уже авторизован - получаем профиль и редиректим
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, approved')
            .eq('id', session.user.id)
            .single()
          
          if (profile?.role === 'admin') {
            window.location.href = '/admin'
            return
          } else if (profile?.approved) {
            window.location.href = '/articles'
            return
          } else {
            window.location.href = '/pending-approval'
            return
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
      
      // Не авторизован - показываем форму
      setCheckingAuth(false)
    }
    
    checkAuth()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password) {
      toast.error('Введите email и пароль')
      return
    }
    
    if (loading) return
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setLoading(false)
        if (error.message.includes('Invalid login')) {
          toast.error('Неверный email или пароль')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email не подтверждён')
        } else {
          toast.error(error.message)
        }
        return
      }

      if (!data?.user) {
        setLoading(false)
        toast.error('Ошибка авторизации')
        return
      }
      
      // Получаем профиль
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        setLoading(false)
        toast.error('Ошибка загрузки профиля')
        return
      }

      toast.success('Вход выполнен!')

      // Редирект
      setTimeout(() => {
        if (profile?.role === 'admin') {
          window.location.href = '/admin'
        } else if (profile?.approved) {
          window.location.href = '/articles'
        } else {
          window.location.href = '/pending-approval'
        }
      }, 300)

    } catch (err) {
      setLoading(false)
      toast.error('Ошибка сети')
    }
  }

  // Показываем загрузку только первые 2 секунды при проверке авторизации
  if (checkingAuth) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 hero-bg -z-10" />
      <div className="fixed inset-0 grid-pattern -z-10" />
      
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.signInTitle}</h1>
            <p className="text-muted-foreground">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl input-premium"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl input-premium pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-premium w-full h-12 text-base text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  {t.signIn}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {t.noAccount}{' '}
              <Link href="/sign-up" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
                {t.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
