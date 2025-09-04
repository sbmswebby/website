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

// 🔁 Retry logic with exponential backoff
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.log(`[AuthProvider] Retry failed (${retries} left):`, err)
    if (retries <= 1) throw err
    await new Promise((res) => setTimeout(res, delay))
    return retry(fn, retries - 1, delay * 2)
  }
}

// 🔄 Reload helper
function safeReload(reason: string) {
  if (typeof window !== 'undefined') {
    console.log('[AuthProvider] 🔄 Reloading page due to persistent failure:', reason)
    window.location.reload()
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 👀 Log when user changes
  useEffect(() => {
    console.log('[AuthProvider] 🔄 User state changed:', user)
  }, [user])

  // 👀 Log when profile changes
  useEffect(() => {
    console.log('[AuthProvider] 🔄 Profile state changed:', profile)
  }, [profile])

  // Initial load + auth state subscription
  useEffect(() => {
    const init = async () => {
      console.log('[AuthProvider:init] 🚀 Starting init...')
      try {
        const { data: { session } } = await retry(() => supabase.auth.getSession())
        console.log('[AuthProvider:init] Session received:', session)

        const currentUser = session?.user ?? null
        console.log('[AuthProvider:init] Setting user:', currentUser)
        setUser(currentUser)

        if (currentUser) {
          console.log('[AuthProvider:init] Fetching profile for user:', currentUser.id)
          try {
            const p = await retry(() => getUserProfile())
            console.log('[AuthProvider:init] Profile fetched:', p)
            setProfile(p)
          } catch (err) {
            console.log('[AuthProvider:init] ❌ Error fetching profile after retries:', err)
            setProfile(null)
            safeReload('init:getUserProfile failed for logged-in user')
          }
        }
      } catch (err) {
        console.log('[AuthProvider:init] ❌ Error in init after retries:', err)
        setUser(null)
        setProfile(null)
      } finally {
        console.log('[AuthProvider:init] ✅ Init finished. Setting loading=false')
        setLoading(false)
      }
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider:onAuthStateChange] 🔔 Event:', event, 'Session:', session)
        try {
          const currentUser = session?.user ?? null
          console.log('[AuthProvider:onAuthStateChange] Setting user:', currentUser)
          setUser(currentUser)

          if (currentUser) {
            console.log('[AuthProvider:onAuthStateChange] Fetching profile for user:', currentUser.id)
            try {
              const p = await retry(() => getUserProfile())
              console.log('[AuthProvider:onAuthStateChange] Profile fetched:', p)
              setProfile(p)
            } catch (err) {
              console.log('[AuthProvider:onAuthStateChange] ❌ Error fetching profile after retries:', err)
              setProfile(null)
              safeReload('onAuthStateChange:getUserProfile failed for logged-in user')
            }
          } else {
            console.log('[AuthProvider:onAuthStateChange] Clearing profile because no user')
            setProfile(null)
          }
        } catch (err) {
          console.log('[AuthProvider:onAuthStateChange] ❌ Error in handler after retries:', err)
          if (user) safeReload('onAuthStateChange handler failed for logged-in user')
          setUser(null)
          setProfile(null)
        } finally {
          console.log('[AuthProvider:onAuthStateChange] ✅ Finished. Setting loading=false')
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('[AuthProvider] 🔌 Unsubscribing from onAuthStateChange')
      subscription.subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    console.log('[AuthProvider:logout] 🚪 Logging out...')
    try {
      await retry(() => supabase.auth.signOut())
      console.log('[AuthProvider:logout] ✅ Successfully logged out')
    } catch (err) {
      console.log('[AuthProvider:logout] ❌ Error during logout after retries:', err)
      if (user) safeReload('logout failed for logged-in user')
    }
    setUser(null)
    setProfile(null)
  }

  const refreshSession = async () => {
    console.log('[AuthProvider:refreshSession] 🔄 Refreshing session...')
    try {
      const { data: { session } } = await retry(() => supabase.auth.getSession())
      console.log('[AuthProvider:refreshSession] Session:', session)
      setUser(session?.user ?? null)
    } catch (err) {
      console.log('[AuthProvider:refreshSession] ❌ Error refreshing session after retries:', err)
      if (user) safeReload('refreshSession failed for logged-in user')
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
    console.log('[AuthProvider:signUp] 📝 Starting signUp for:', email)
    try {
      const { data: authData, error: authError } = await retry(() =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
      )

      console.log('[AuthProvider:signUp] Auth result:', { authData, authError })
      if (authError) return { error: authError.message }

      const newUser = authData.user ?? authData.session?.user
      if (!newUser) return { error: 'No user returned from sign up' }

      console.log('[AuthProvider:signUp] Inserting profile for user:', newUser.id)
      const { error: profileError } = await retry(
        async () =>
          await supabase
            .from('user_profiles')
            .insert({
              id: newUser.id,
              full_name: fullName,
              number,
              insta_id: instaId || null,
              organisation: organisation || null,
              age,
              gender: gender || null,
            })
            .select()
            .single()
      )

      if (profileError) {
        console.log('[AuthProvider:signUp] ❌ Profile insert error:', profileError)
        return { error: profileError.message }
      }

      setUser(newUser)
      try {
        const p = await retry(() => getUserProfile())
        console.log('[AuthProvider:signUp] Profile fetched after signup:', p)
        setProfile(p)
      } catch (err) {
        console.log('[AuthProvider:signUp] ❌ Error fetching profile after retries:', err)
        if (authData.session?.user) safeReload('post-signUp getUserProfile failed for logged-in user')
        return { error: 'Failed to fetch profile after sign up' }
      }

      console.log('[AuthProvider:signUp] ✅ SignUp completed')
      return {}
    } catch (err) {
      console.log('[AuthProvider:signUp] ❌ Error during signUp after retries:', err)
      const message = err instanceof Error ? err.message : 'Sign up failed'
      return { error: message }
    }
  }

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) {
      console.log('[AuthProvider:updateProfile] ❌ Cannot update: not signed in')
      return { error: 'Not signed in' }
    }

    console.log('[AuthProvider:updateProfile] ✏️ Updating profile for user:', user.id, 'Updates:', updates)
    try {
      const { error } = await retry(
        async () =>
          await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
      )

      if (error) {
        console.log('[AuthProvider:updateProfile] ❌ Update error:', error)
        return { error: error.message }
      }

      const p = await retry(() => getUserProfile())
      console.log('[AuthProvider:updateProfile] ✅ Updated profile fetched:', p)
      setProfile(p)
      return {}
    } catch (err) {
      console.log('[AuthProvider:updateProfile] ❌ Error updating profile after retries:', err)
      safeReload('updateProfile failed for logged-in user')
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
