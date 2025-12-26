'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword } from '@/lib/supabase'
import { toast } from 'sonner'
import { translations } from '@/lib/i18n'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [language] = useState('ru')
  const t = translations[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success(t.passwordResetSent)
        setSent(true)
      }
    } catch (error) {
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-md">
        <Card className="border-purple-900/50 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">
              {t.resetPasswordTitle}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {sent
                ? 'Проверьте свою почту для сброса пароля'
                : 'Введите email для восстановления пароля'}
            </CardDescription>
          </CardHeader>
          {!sent ? (
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
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? t.loading : t.sendResetLink}
                </Button>
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center text-sm text-purple-400 hover:text-purple-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToSignIn}
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/sign-in">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToSignIn}
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}