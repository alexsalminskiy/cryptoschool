'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Users, ArrowLeft, LogOut, Loader2, Sun, Moon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { translations } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Флаги как SVG
const flags = {
  ru: (
    <svg className="w-6 h-4 rounded-sm" viewBox="0 0 640 480">
      <rect fill="#fff" width="640" height="160"/>
      <rect fill="#0039a6" y="160" width="640" height="160"/>
      <rect fill="#d52b1e" y="320" width="640" height="160"/>
    </svg>
  ),
  en: (
    <svg className="w-6 h-4 rounded-sm" viewBox="0 0 640 480">
      <path fill="#012169" d="M0 0h640v480H0z"/>
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
    </svg>
  ),
  kk: (
    <svg className="w-6 h-4 rounded-sm" viewBox="0 0 640 480">
      <path fill="#00afca" d="M0 0h640v480H0z"/>
      <path fill="#fec50c" d="M320 120a120 120 0 1 0 0 240 120 120 0 0 0 0-240zm0 200a80 80 0 1 1 0-160 80 80 0 0 1 0 160z"/>
      <path fill="#fec50c" d="M320 80l10 30h32l-26 19 10 31-26-19-26 19 10-31-26-19h32z"/>
    </svg>
  )
}

const languages = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'kk', name: 'Қазақша' }
]

export default function AdminLayout({ children }) {
  const { isAdmin, loading, user, profile, signOut, signingOut } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const t = translations[language] || translations.ru

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Даём 3 секунды на загрузку, потом всё равно проверяем
    const timeout = setTimeout(() => {
      setCheckingAccess(false)
    }, 3000)

    if (!loading) {
      setCheckingAccess(false)
      clearTimeout(timeout)
    }

    return () => clearTimeout(timeout)
  }, [loading])

  useEffect(() => {
    if (!checkingAccess && !loading && !isAdmin) {
      console.log('Not admin, redirecting...', { user: !!user, profile, isAdmin })
      router.push('/')
    }
  }, [isAdmin, loading, checkingAccess, router, user, profile])

  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (signingOut) return
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const menuItems = [
    { href: '/admin', label: t.dashboard, icon: LayoutDashboard, exact: true },
    { href: '/admin/articles', label: t.articlesManagement, icon: FileText },
    { href: '/admin/users', label: t.usersManagement, icon: Users }
  ]

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-purple-900/30 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-900/30">
            <Link href="/admin">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                {t.admin}
              </h2>
            </Link>
            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
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
                    active 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                      : "text-slate-300 hover:bg-purple-900/30"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-purple-900/30 space-y-2">
            {/* Language & Theme */}
            <div className="flex gap-2 mb-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-1 justify-start text-slate-300 hover:bg-purple-900/20">
                    <span className="mr-2">{flags[language]}</span>
                    <span>{languages.find(l => l.code === language)?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={language === lang.code ? 'bg-purple-500/20' : ''}
                    >
                      <span className="mr-2">{flags[lang.code]}</span>
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="text-slate-300 hover:bg-purple-900/20"
              >
                {mounted && (resolvedTheme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />)}
              </Button>
            </div>
            
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
              className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-900/20"
            >
              {signingOut ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Выход...</>
              ) : (
                <><LogOut className="mr-2 h-4 w-4" /> {t.signOut}</>
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
