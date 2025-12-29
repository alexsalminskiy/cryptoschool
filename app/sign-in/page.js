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
    console.log('Attempting login for:', email.trim())

    try {
      // Вход в систему
      console.log('Calling Supabase signInWithPassword...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      console.log('Supabase response:', { authData: !!authData?.user, authError })

      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('Invalid login')) {
          toast.error('Неверный email или пароль')
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error('Email не подтверждён. Проверьте почту.')
        } else {
          toast.error('Ошибка: ' + authError.message)
        }
        setLoading(false)
        return
      }

      if (!authData?.user) {
        console.error('No user in authData')
        toast.error('Ошибка авторизации - нет данных пользователя')
        setLoading(false)
        return
      }

      console.log('User authenticated, fetching profile...')
      
      // Получаем профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', authData.user.id)
        .single()
      
      console.log('Profile:', profile, 'Error:', profileError)

      if (profileError) {
        console.error('Profile error:', profileError)
        toast.error('Ошибка загрузки профиля')
        setLoading(false)
        return
      }

      toast.success('Вход выполнен!')

      // Перенаправление
      const redirectUrl = profile?.role === 'admin' ? '/admin' : (profile?.approved ? '/articles' : '/pending-approval')
      console.log('Redirecting to:', redirectUrl)
      
      window.location.href = redirectUrl

    } catch (error) {
      console.error('Login error:', error)
      toast.error('Ошибка входа: ' + error.message)
      setLoading(false)
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
                  {t.signUpLink}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
