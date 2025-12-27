'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password) {
      toast.error('Введите email и пароль')
      return
    }
    
    setLoading(true)

    try {
      // Вход в систему с таймаутом
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Таймаут - попробуйте ещё раз')), 10000)
      )
      
      const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise])

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          toast.error('Неверный email или пароль')
        } else {
          toast.error(authError.message)
        }
        setLoading(false)
        return
      }

      if (!authData?.user) {
        toast.error('Ошибка авторизации')
        setLoading(false)
        return
      }

      // Проверяем профиль через API
      const profileResponse = await fetch(`/api/users`)
      const users = await profileResponse.json()
      const profile = users.find(u => u.id === authData.user.id)

      toast.success('Вход выполнен!')

      // Перенаправление
      setTimeout(() => {
        if (profile?.role === 'admin') {
          window.location.href = '/admin'
        } else if (profile?.approved) {
          window.location.href = '/articles'
        } else {
          window.location.href = '/pending-approval'
        }
      }, 300)

    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Ошибка входа')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-md">
        <Card className="border-purple-900/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-500 dark:text-purple-300">{t.signInTitle}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Войдите в свой аккаунт
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Вход...</>
                ) : (
                  t.signIn
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {t.noAccount}{' '}
                <Link href="/sign-up" className="text-purple-500 hover:text-purple-400">
                  {t.signUp}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
