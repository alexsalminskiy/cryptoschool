import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from '@/components/ui/sonner'
import HeaderWrapper from '@/components/HeaderWrapper'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'], 
  variable: '--font-inter',
  display: 'swap', // Предотвращает мерцание шрифтов
  preload: true
})

export const metadata = {
  title: 'Crypto Academy | Learn Cryptocurrencies & Blockchain',
  description: 'Modern educational platform for cryptocurrencies, DeFi, NFT and blockchain technologies',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={true}
          storageKey="theme"
        >
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
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
