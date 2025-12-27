'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function HeaderWrapper() {
  const pathname = usePathname()
  
  // Скрываем Header на страницах админ панели
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <Header />
}
