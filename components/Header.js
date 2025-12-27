'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, X, Globe, LogOut, Settings, Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { translations } from '@/lib/i18n'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, profile, isAdmin, signOut, signingOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState('ru')
  const [mounted, setMounted] = useState(false)

  // Предотвращаем hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = translations[language]

  // Обработчик выхода - напрямую вызывает signOut
  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (signingOut) return // Уже выходим
    
    console.log('Header: handleSignOut called')
    await signOut()
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Навигация только для авторизованных
  const navLinks = []
  
  if (user && profile?.approved) {
    navLinks.push({ href: '/articles', label: t.articles })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Crypto Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    pathname === link.href
                      ? 'text-purple-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-purple-500/20 transition-colors"
                >
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => setLanguage('ru')}
                  className={language === 'ru' ? 'bg-purple-500/20' : ''}
                >
                  🇷🇺 Русский {language === 'ru' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-purple-500/20' : ''}
                >
                  🇬🇧 English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('kk')}
                  className={language === 'kk' ? 'bg-purple-500/20' : ''}
                >
                  🇰🇿 Қазақша {language === 'kk' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full hover:bg-purple-500/20 transition-colors"
              aria-label="Переключить тему"
            >
              {mounted && (
                resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="h-5 w-5 text-purple-500 transition-transform hover:-rotate-12" />
                )
              )}
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Admin Panel Button - отдельная кнопка */}
                {isAdmin && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                    className="h-10 px-4 rounded-full border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Админ
                  </Button>
                )}
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 px-4 rounded-full border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/20 transition-all"
                    >
                      <span className="max-w-[100px] truncate">
                        {profile?.first_name || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
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
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/sign-in')}
                  className="h-10 px-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-purple-500/20 transition-all"
                >
                  {t.signIn}
                </Button>
                <Button
                  onClick={() => router.push('/sign-up')}
                  className="h-10 px-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  {t.signUp}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            {navLinks.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && navLinks.length > 0 && (
          <nav className="md:hidden py-4 space-y-2 border-t border-purple-900/20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors hover:bg-purple-500/20 ${
                  pathname === link.href
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
