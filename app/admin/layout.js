'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Users, ArrowLeft } from 'lucide-react'
import { translations } from '@/lib/i18n'

export default function AdminLayout({ children }) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const language = 'ru'
  const t = translations[language]

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log('Admin check:', { isAdmin, loading })
      router.push('/')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-purple-400">{t.loading}</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-purple-900/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-purple-300 mb-6">{t.admin}</h2>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-slate-300 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t.dashboard}
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-slate-300 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <Link href="/admin/articles">
                <FileText className="mr-2 h-4 w-4" />
                {t.articlesManagement}
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-slate-300 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                {t.usersManagement}
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-slate-300 hover:text-purple-300 hover:bg-purple-900/20 mt-8"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.home}
              </Link>
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

function useState(initialValue) {
  return [initialValue]
}