'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Mail, LogOut, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth()
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [status, setStatus] = useState('pending') // 'pending', 'approved', 'redirecting'
  const [userProfile, setUserProfile] = useState(null)

  // Функция проверки статуса
  const checkApprovalStatus = async (showToast = true) => {
    if (!user) {
      if (showToast) toast.error('Пользователь не авторизован')
      return
    }

    if (status === 'redirecting') return

    setCheckingStatus(true)
    try {
      // Добавляем timestamp чтобы избежать кэширования
      const timestamp = Date.now()
      const response = await fetch(`/api/check-profile?userId=${user.id}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      const result = await response.json()

      if (!response.ok || result.error) {
        console.error('Error:', result.error)
        if (showToast) toast.error('Ошибка проверки статуса')
        return
      }

      const profile = result.profile
      setUserProfile(profile)

      // Проверяем одобрение
      if (profile?.approved === true || profile?.role === 'admin') {
        setStatus('approved')
        toast.success('Ваш аккаунт одобрен! Перенаправление...')
        
        // Делаем редирект через 1.5 секунды
        setTimeout(() => {
          setStatus('redirecting')
          const targetUrl = profile?.role === 'admin' ? '/admin' : '/articles'
          window.location.replace(targetUrl)
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

  // Проверяем при загрузке
  useEffect(() => {
    if (user) {
      checkApprovalStatus(false)
    }
  }, [user])

  // Автоматическая проверка каждые 5 секунд
  useEffect(() => {
    if (!user || status !== 'pending') return

    const interval = setInterval(() => {
      checkApprovalStatus(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [user, status])

  const handleSignOut = async () => {
    await signOut()
  }

  // Если одобрен или редирект - показываем успех
  if (status === 'approved' || status === 'redirecting') {
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
                Перенаправление...
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
              {checkingStatus && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                  <span className="text-purple-400">Проверка статуса...</span>
                </div>
              )}
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
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Проверить статус
                  </>
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
                💡 Страница автоматически проверяет статус каждые 5 секунд
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
