'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Mail, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'

export default function PendingApprovalPage() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [checkingStatus, setCheckingStatus] = useState(false)
  const language = 'ru'
  const t = translations[language]

  useEffect(() => {
    // Redirect if approved
    if (profile?.approved) {
      router.push('/articles')
    }
  }, [profile, router])

  const checkApprovalStatus = async () => {
    setCheckingStatus(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user?.id)
        .single()

      if (data?.approved) {
        router.push('/articles')
      }
    } catch (error) {
      console.error('Error checking approval:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-600/20">
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl text-purple-300">
              Ожидание одобрения
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              Ваш аккаунт ожидает подтверждения администратором
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-yellow-600/50 bg-yellow-600/10 p-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-yellow-300">
                    Что происходит?
                  </h3>
                  <p className="text-sm text-slate-300">
                    Ваша регистрация успешно завершена! Теперь администратор должен одобрить ваш аккаунт для доступа к образовательным материалам.
                  </p>
                  <p className="text-sm text-slate-300">
                    Это обычно занимает от нескольких минут до 24 часов.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Ваш email: <strong className="text-purple-300">{user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span>Статус: <strong className="text-yellow-300">Ожидание</strong></span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={checkApprovalStatus}
                disabled={checkingStatus}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {checkingStatus ? 'Проверка...' : 'Проверить статус одобрения'}
              </Button>
              
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full border-slate-700 text-slate-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs text-slate-400 text-center">
                💡 <strong>Совет:</strong> Вы получите уведомление на email, когда ваш аккаунт будет одобрен. После этого вы сможете войти и получить полный доступ к платформе.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}