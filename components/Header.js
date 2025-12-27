'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, X, LogOut, Settings, Loader2, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/i18n'

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' }
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, profile, isAdmin, signOut, signingOut } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const t = translations[language] || translations.ru
  const currentLang = languages.find(l => l.code === language) || languages[0]

  const handleSignOut = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (signingOut) return
    await signOut()
  }

  const navLinks = []
  if (user && profile?.approved) {
    navLinks.push({ href: '/articles', label: t.articles })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Crypto Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    pathname === link.href ? 'text-purple-400' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-purple-500/20"
                >
                  <span className="text-xl">{currentLang.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`cursor-pointer ${language === lang.code ? 'bg-purple-500/20' : ''}`}
                  >
                    <span className="text-xl mr-3">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 rounded-full hover:bg-purple-500/20"
            >
              {mounted && (
                resolvedTheme === 'dark' 
                  ? <Sun className="h-5 w-5 text-yellow-400" /> 
                  : <Moon className="h-5 w-5 text-purple-500" />
              )}
            </Button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                    className="h-10 px-4 rounded-full border-purple-500/50 hover:bg-purple-500/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t.admin}
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 px-4 rounded-full border-purple-500/50 hover:bg-purple-500/20"
                    >
                      {profile?.first_name || user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="cursor-pointer text-red-400 focus:text-red-400"
                    >
                      {signingOut ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Выход...</>
                      ) : (
                        <><LogOut className="mr-2 h-4 w-4" /> {t.signOut}</>
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
                  className="h-10 px-4 rounded-full hover:bg-purple-500/20"
                >
                  {t.signIn}
                </Button>
                <Button
                  onClick={() => router.push('/sign-up')}
                  className="h-10 px-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg"
                >
                  {t.signUp}
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            {navLinks.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && navLinks.length > 0 && (
          <nav className="md:hidden py-4 space-y-2 border-t border-purple-900/20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 rounded-lg hover:bg-purple-500/20"
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
