'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Mail, LogOut, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth()
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [approved, setApproved] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const hasRedirected = useRef(false) // Предотвращаем повторный редирект

  // Проверяем статус при загрузке страницы
  useEffect(() => {
    if (user && !hasRedirected.current) {
      checkApprovalStatus(false)
    }
  }, [user])

  // Автоматическая проверка каждые 10 секунд (только если ещё не одобрен)
  useEffect(() => {
    if (!user || approved || redirecting || hasRedirected.current) return
    
    const interval = setInterval(() => {
      if (!hasRedirected.current) {
        checkApprovalStatus(false)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [user, approved, redirecting])

  const checkApprovalStatus = async (showToast = true) => {
    // Предотвращаем проверку если уже редиректим
    if (!user || hasRedirected.current || redirecting) {
      if (showToast && !user) toast.error('Пользователь не авторизован')
      return
    }

    setCheckingStatus(true)
    try {
      console.log('Checking approval for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('approved, role')
        .eq('id', user.id)
        .single()

      console.log('Approval check result:', data, error)

      if (error) {
        console.error('Error checking approval:', error)
        if (showToast) toast.error('Ошибка проверки статуса')
        return
      }

      if ((data?.approved === true || data?.role === 'admin') && !hasRedirected.current) {
        // Устанавливаем флаги до редиректа
        hasRedirected.current = true
        setApproved(true)
        setRedirecting(true)
        toast.success('Ваш аккаунт одобрен! Перенаправление...')
        
        // Используем window.location.href для надёжного редиректа
        setTimeout(() => {
          window.location.href = '/articles'
        }, 1500)
      } else {
        if (showToast) toast.info('Ваш аккаунт ещё не одобрен')
      }
    } catch (error) {
      console.error('Error:', error)
      if (showToast) toast.error('Ошибка проверки')
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    // signOut уже делает редирект через window.location.href
  }

  // Если одобрен - показываем сообщение об успехе
  if (approved) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <Card className="border-green-500/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-600/20">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <CardTitle className="text-3xl text-green-400">
                Аккаунт одобрен!
              </CardTitle>
              <CardDescription className="text-lg">
                Перенаправление на страницу статей...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <Card className="border-purple-900/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-600/20">
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl text-purple-400">
              Ожидание одобрения
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Ваш аккаунт ожидает подтверждения администратором
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-yellow-600/50 bg-yellow-600/10 p-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-yellow-400">
                    Что происходит?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ваша регистрация успешно завершена! Теперь администратор должен одобрить ваш аккаунт для доступа к образовательным материалам.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Это обычно занимает от нескольких минут до 24 часов.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Ваш email: <strong className="text-purple-400">{user?.email || 'Загрузка...'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span>Статус: <strong className="text-yellow-400">Ожидание</strong></span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => checkApprovalStatus(true)}
                disabled={checkingStatus}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  'Проверить статус одобрения'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full border-border"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground text-center">
                💡 <strong>Совет:</strong> Страница автоматически проверяет статус каждые 10 секунд. После одобрения вы будете перенаправлены автоматически.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
