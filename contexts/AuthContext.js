'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  // Быстрая функция получения профиля
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, approved, first_name, last_name, middle_name')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }
      return data
    } catch (e) {
      console.error('Profile fetch exception:', e)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (mounted && profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (mounted && profileData) {
            setProfile(profileData)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Улучшенная функция выхода
  const signOut = useCallback(async () => {
    if (signingOut) return // Предотвращаем двойной вызов
    
    setSigningOut(true)
    console.log('Signing out...')
    
    try {
      // Сначала очищаем локальное состояние
      setUser(null)
      setProfile(null)
      
      // Затем выходим из Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      console.log('Sign out successful')
      
      // Очищаем localStorage на всякий случай
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        // Удаляем все ключи Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Перенаправляем на главную
      router.push('/')
      router.refresh()
      
    } catch (error) {
      console.error('Error signing out:', error)
      // Всё равно перенаправляем
      router.push('/')
    } finally {
      setSigningOut(false)
    }
  }, [signingOut, router])

  const value = {
    user,
    profile,
    loading,
    signingOut,
    isAdmin: profile?.role === 'admin',
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
