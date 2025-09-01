'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getUserProfile, UserProfile } from '@/lib/supabaseHelpers'

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  signUp: (data: {
    email: string
    password: string
    fullName: string
    number: string
    instaId?: string | null
    organisation?: string | null
    age?: number | null
    gender?: string | null
  }) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshSession: async () => {},
  signUp: async () => ({ error: 'Not implemented' }),
  updateProfile: async () => ({ error: 'Not implemented' }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const p = await getUserProfile()
        setProfile(p)
      }
      setLoading(false)
    }
    init()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const p = await getUserProfile()
          setProfile(p)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  const signUp: AuthContextType['signUp'] = async ({
    email,
    password,
    fullName,
    number,
    instaId,
    organisation,
    age,
    gender,
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authError) return { error: authError.message }

    const newUser = authData.user ?? authData.session?.user
    if (!newUser) return { error: 'No user returned from sign up' }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: newUser.id,
      full_name: fullName,
      number,
      insta_id: instaId || null,
      organisation: organisation || null,
      age,
      gender: gender || null,
    })

    if (profileError) return { error: profileError.message }

    setUser(newUser)
    setProfile(await getUserProfile())
    return {}
  }

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) return { error: error.message }

    setProfile(await getUserProfile())
    return {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshSession,
        signUp,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
