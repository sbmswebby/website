
// components/auth/AuthGuard.tsx
'use client'
import { useAuth } from './AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole,
  fallback 
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/auth/signin')
        return
      }
      
      if (requiredRole && (!profile || !requiredRole.includes(profile.role))) {
        router.push('/unauthorized')
        return
      }
      
      setChecking(false)
    }
  }, [user, profile, loading, requireAuth, requiredRole, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return fallback || null
  }

  if (requiredRole && (!profile || !requiredRole.includes(profile.role))) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don`t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
