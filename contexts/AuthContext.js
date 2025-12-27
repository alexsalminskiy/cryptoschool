'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
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

  useEffect(() => {
    // Check active sessions
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session?.user?.email)
        if (session?.user) {
          setUser(session.user)
          try {
            const { data: profileData, error } = await getUserProfile(session.user.id)
            console.log('Profile data:', profileData, 'Error:', error)
            if (profileData) {
              setProfile(profileData)
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          try {
            const { data: profileData, error } = await getUserProfile(session.user.id)
            console.log('Profile data on auth change:', profileData, 'Error:', error)
            if (profileData) {
              setProfile(profileData)
            }
          } catch (profileError) {
            console.error('Error fetching profile on auth change:', profileError)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
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
