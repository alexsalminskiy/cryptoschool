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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [loading, setLoading] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Укажите Фамилию и Имя')
      return
    }

    if (!email.trim()) {
      toast.error('Укажите Email')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают!')
      return
    }
    
    setLoading(true)

    try {
      // Регистрация без email подтверждения
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          // Отключаем email подтверждение
          emailRedirectTo: undefined,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim()
          }
        }
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Этот email уже зарегистрирован')
        } else {
          toast.error(authError.message)
        }
        return
      }

      // Создаём профиль
      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          middle_name: middleName.trim() || null,
          role: 'user',
          approved: false,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })
      }

      toast.success('Регистрация успешна!')
      router.push('/pending-approval')
      
    } catch (error) {
      toast.error('Ошибка регистрации')
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`bg-background border-border ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500">Пароли не совпадают</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading || (confirmPassword && password !== confirmPassword)}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Регистрация...</>
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
