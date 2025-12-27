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

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [loading, setLoading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Укажите Фамилию и Имя')
      return
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Укажите Email и Пароль')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }
    
    setLoading(true)

    try {
      console.log('Starting registration for:', email)

      // 1. Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            middle_name: middleName.trim() || null
          }
        }
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered')) {
          toast.error('Этот email уже зарегистрирован')
        } else {
          toast.error(authError.message)
        }
        return
      }

      console.log('Auth successful:', authData.user?.id)

      // 2. Создаём профиль вручную (на случай если триггер не сработал)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            middle_name: middleName.trim() || null,
            role: 'user',
            approved: false,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Не прерываем - профиль мог создаться через триггер
        } else {
          console.log('Profile created successfully')
        }
      }

      toast.success('Регистрация успешна!')
      
      // 3. Перенаправляем на страницу ожидания
      router.push('/pending-approval')
      
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Ошибка регистрации: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-md">
        <Card className="border-purple-900/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-500 dark:text-purple-300">{t.signUpTitle}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Создайте аккаунт для доступа к материалам
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  type="text"
                  placeholder="Иванович"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email} *</Label>
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
                <Label htmlFor="password">{t.password} *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  t.signUp
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                После регистрации администратор должен одобрить ваш аккаунт
              </p>
              <div className="text-center text-sm text-muted-foreground">
                {t.hasAccount}{' '}
                <Link href="/sign-in" className="text-purple-500 hover:text-purple-400">
                  {t.signIn}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
