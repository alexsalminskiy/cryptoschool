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

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
          toast.error('Этот email уже зарегистрирован. Попробуйте войти или обратитесь к администратору.')
        } else {
          toast.error(authError.message)
        }
        return
      }

      // Проверяем, создан ли реально новый пользователь
      // (Supabase может вернуть данные без ошибки, но с identities: [])
      if (!authData.user || (authData.user.identities && authData.user.identities.length === 0)) {
        toast.error('Этот email уже зарегистрирован. Попробуйте войти или обратитесь к администратору.')
        return
      }

      // Создаём профиль или обновляем если уже создан триггером
      if (authData.user) {
        // Используем update вместо upsert, потому что триггер уже мог создать профиль
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            middle_name: middleName.trim() || null,
          })
          .eq('id', authData.user.id)
        
        // Если update не нашёл запись (нет триггера), тогда insert
        if (updateError) {
          await supabase.from('profiles').insert({
            id: authData.user.id,
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            middle_name: middleName.trim() || null,
            role: 'user',
            approved: false,
            created_at: new Date().toISOString()
          })
        }
      }

      toast.success('Регистрация успешна!')
      
      // Используем window.location для надёжного редиректа
      window.location.href = '/pending-approval'
      
    } catch (error) {
      toast.error('Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-20 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-md">
        <Card className="border-purple-900/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
            <CardTitle className="text-xl sm:text-2xl text-purple-500 dark:text-purple-300">{t.signUpTitle}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Создайте аккаунт для доступа к материалам
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Фамилия *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder=""
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background border-border h-11"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="firstName" className="text-sm">Имя *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder=""
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background border-border h-11"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="middleName" className="text-sm">Отчество</Label>
                <Input
                  id="middleName"
                  type="text"
                  placeholder=""
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="bg-background border-border h-11"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">{t.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border h-11"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-sm">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background border-border pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Подтвердите пароль *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className={`bg-background border-border pr-10 h-11 ${
                      confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500">Пароли не совпадают</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base"
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
                <Link href="/sign-in" className="text-purple-500 hover:text-purple-400 font-medium">
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
