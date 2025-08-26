'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthResponse } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import type { UserProfile } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('⚡ AuthProvider mounted, fetching initial session...')
    
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Error getting session:', error)
        } else {
          console.log('🟢 Initial session:', session)
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('📥 Loading profile for user:', session.user.id)
          await loadUserProfile(session.user.id)
        }

      } catch (err) {
        console.error('❌ Exception getting initial session:', err)
      } finally {
        setLoading(false)
        console.log('🔄 Initial session loading done')
      }
    }

    getInitialSession()

    console.log('⚡ Setting up auth state change listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change event:', event, 'session:', session)
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('📥 User signed in, loading profile:', session.user.id)
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing profile')
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 Unsubscribing from auth state changes')
      subscription.unsubscribe()
    }
  }, [])

const loadUserProfile = async (userId: string) => {
  console.log('🔄 Loading user profile for:', userId)
  try {
    const { data, error, status } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    console.log('📡 Profile fetch result:', { status, data, error })
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error loading user profile:', error)
    } else if (!data) {
      console.warn('⚠️ No profile found for userId:', userId)
    } else {
      console.log('🟢 User profile loaded:', data)
      setProfile(data)
    }
  } catch (err) {
    console.error('❌ Exception loading user profile:', err)
  }
}
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    console.log('🆕 Attempting sign up with:', email)
    const result = await supabase.auth.signUp({ email, password })
    console.log('🟢 Sign up result:', result)
    return result
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    console.log('➡️ Attempting sign in with:', email)
    const result = await supabase.auth.signInWithPassword({ email, password })
    console.log('🟢 Sign in result:', result)
    return result
  }

  const signOut = async () => {
    console.log('🚪 Signing out user...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Sign out error:', error)
      throw error
    } else {
      console.log('🟢 Sign out successful')
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id)
      await loadUserProfile(user.id)
    } else {
      console.log('⚠️ No user to refresh profile for')
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
