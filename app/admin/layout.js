'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Users, ArrowLeft, LogOut, Loader2 } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }) {
  const { isAdmin, loading, user, profile, signOut, signingOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const language = 'ru'
  const t = translations[language]

  useEffect(() => {
    console.log('[AdminLayout] useEffect triggered', { isAdmin, loading, user: !!user, profile })
    if (!loading && !isAdmin) {
      console.log('[AdminLayout] Not admin, redirecting to home')
      router.push('/')
    } else if (!loading && isAdmin) {
      console.log('[AdminLayout] User is admin! ✅')
    }
  }, [isAdmin, loading, router, user, profile])

  // Обработчик выхода
  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (signingOut) return
    
    console.log('[AdminLayout] Signing out...')
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-purple-400 text-xl">{t.loading}</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const menuItems = [
    {
      href: '/admin',
      label: t.dashboard,
      icon: LayoutDashboard,
      exact: true
    },
    {
      href: '/admin/articles',
      label: t.articlesManagement,
      icon: FileText
    },
    {
      href: '/admin/users',
      label: t.usersManagement,
      icon: Users
    }
  ]

  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-purple-900/30 bg-slate-950/60 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-900/30">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
              {t.admin}
            </h2>
            <p className="text-sm text-slate-400">
              {user?.email}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "group relative overflow-hidden",
                    active 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50" 
                      : "text-slate-300 hover:bg-purple-900/30 hover:text-purple-200"
                  )}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 relative z-10 transition-transform duration-200",
                    active ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="relative z-10 font-medium">
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-purple-900/30 space-y-2">
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-slate-300 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.home}
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-900/20 disabled:opacity-50"
            >
              {signingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Выход...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.signOut}
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
