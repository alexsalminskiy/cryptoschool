'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { translations } from '@/lib/i18n'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = translations.ru

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password) {
      toast.error('Введите email и пароль')
      return
    }
    
    if (loading) return // Защита от двойного клика
    
    setLoading(true)

    try {
      // Простой вход без таймаута
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', data.user.id)
        .single()

      toast.success('Вход выполнен!')

      // Редирект
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else if (profile?.approved) {
        window.location.href = '/articles'
      } else {
        window.location.href = '/pending-approval'
      }

    } catch (err) {
      setLoading(false)
      toast.error('Ошибка сети. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-md">
        <Card className="border-purple-900/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
            <CardTitle className="text-xl sm:text-2xl text-purple-500 dark:text-purple-300">{t.signInTitle}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Войдите в свой аккаунт
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  t.signIn
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t.noAccount}{' '}
                <Link href="/sign-up" className="text-purple-500 hover:text-purple-400 hover:underline">
                  {t.signUp}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
