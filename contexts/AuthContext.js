'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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
  const router = useRouter()

  useEffect(() => {
    // Check active sessions
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session?.user?.email)
        if (session?.user) {
          setUser(session.user)
          const { data: profileData } = await getUserProfile(session.user.id)
          console.log('Profile data:', profileData)
          setProfile(profileData)
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
        if (session?.user) {
          setUser(session.user)
          const { data: profileData } = await getUserProfile(session.user.id)
          console.log('Profile data on auth change:', profileData)
          setProfile(profileData)
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

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut: async () => {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push('/')
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}