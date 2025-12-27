import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from '@/components/ui/sonner'
import HeaderWrapper from '@/components/HeaderWrapper'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const merriweather = Merriweather({ 
  weight: ['300', '400', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-merriweather'
})

export const metadata = {
  title: 'Crypto Academy | Learn Cryptocurrencies & Blockchain',
  description: 'Modern educational platform for cryptocurrencies, DeFi, NFT and blockchain technologies',
}

export default function RootLayout({ children }) {
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
                <HeaderWrapper />
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
