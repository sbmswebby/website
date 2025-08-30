'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'

export default function ResetPasswordLink() {
  const { user } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (!user?.email) {
      setMessage('No email found for this user.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`, // route where user resets password
      })

      if (error) throw error

      setMessage('Password reset email sent! Please check your inbox.')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`)
      } else {
        setMessage('Failed to send reset email.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <a
        href="#"
        onClick={handleReset}
        className="text-blue-600 hover:underline cursor-pointer"
      >
        {loading ? 'Sending...' : 'Reset password via email link'}
      </a>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
