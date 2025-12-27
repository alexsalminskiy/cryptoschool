'use client'

import { usePathname } from 'next/navigation'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background transition-colors duration-300">
                {!isAdminPage && <Header />}
                <main>{children}</main>
                <Toaster />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
