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
import { Loader2 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Вход в систему
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          toast.error('Неверный email или пароль')
        } else {
          toast.error(authError.message)
        }
        return
      }

      // Проверяем профиль пользователя
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved, role')
        .eq('id', authData.user.id)
        .single()

      toast.success('Вход выполнен!')

      // Небольшая задержка для обновления состояния Auth
      await new Promise(resolve => setTimeout(resolve, 500))

      // Перенаправление в зависимости от статуса
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else if (profile?.approved) {
        window.location.href = '/articles'
      } else {
        window.location.href = '/pending-approval'
      }

    } catch (error) {
      toast.error('Ошибка входа')
    } finally {
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border"
                />
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
