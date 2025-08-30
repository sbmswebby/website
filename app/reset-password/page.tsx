'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setMessage('✅ Password updated successfully! Redirecting...')
      setTimeout(() => router.push('/login'), 2000) // redirect after success
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`)
      } else {
        setMessage('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id='signIn' className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-semibold mb-4">Reset your password</h1>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center ">{message}</p>
        )}
      </div>
    </div>
  )
}
