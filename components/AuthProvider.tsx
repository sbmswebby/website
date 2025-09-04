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

// 🔁 Helper: retry logic with exponential backoff
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.log(`Retry failed (${retries} left):`, err)
    if (retries <= 1) throw err
    await new Promise((res) => setTimeout(res, delay))
    return retry(fn, retries - 1, delay * 2)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await retry(() => supabase.auth.getSession())
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          try {
            const p = await retry(() => getUserProfile())
            setProfile(p)
          } catch (err) {
            console.log('Error fetching profile in init:', err)
            setProfile(null)
          }
        }
      } catch (err) {
        console.log('Error in init:', err)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)

          if (currentUser) {
            try {
              const p = await retry(() => getUserProfile())
              setProfile(p)
            } catch (err) {
              console.log('Error fetching profile in onAuthStateChange:', err)
              setProfile(null)
            }
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.log('Error in onAuthStateChange:', err)
          setUser(null)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await retry(() => supabase.auth.signOut())
    } catch (err) {
      console.log('Error during logout:', err)
    }
    setUser(null)
    setProfile(null)
  }

  const refreshSession = async () => {
    try {
      const { data: { session } } = await retry(() => supabase.auth.getSession())
      setUser(session?.user ?? null)
    } catch (err) {
      console.log('Error refreshing session:', err)
      setUser(null)
    }
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
    try {
      const { data: authData, error: authError } = await retry(() =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
      )

      if (authError) return { error: authError.message }

      const newUser = authData.user ?? authData.session?.user
      if (!newUser) return { error: 'No user returned from sign up' }

      const { error: profileError } = await retry(async () =>
        await supabase.from('user_profiles').insert({
          id: newUser.id,
          full_name: fullName,
          number,
          insta_id: instaId || null,
          organisation: organisation || null,
          age,
          gender: gender || null,
        })
      )

      if (profileError) return { error: profileError.message }

      setUser(newUser)
      setProfile(await retry(() => getUserProfile()))
      return {}
    } catch (err) {
      console.log('Error during signUp:', err)
      const message = err instanceof Error ? err.message : 'Sign up failed'
      return { error: message }
    }
  }

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return { error: 'Not signed in' }

    try {
      const { error } = await retry(async () =>
        await supabase.from('user_profiles').update(updates).eq('id', user.id)
      )

      if (error) return { error: error.message }

      setProfile(await retry(() => getUserProfile()))
      return {}
    } catch (err) {
      console.log('Error updating profile:', err)
      const message = err instanceof Error ? err.message : 'Update failed'
      return { error: message }
    }
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
