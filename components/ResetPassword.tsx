'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [canReset, setCanReset] = useState(false)
  const [message, setMessage] = useState<string | null>('Validating reset link…')
  const [loading, setLoading] = useState(false)

  // Debug helper
  const log = (...args: unknown[]) => console.log('[ResetPassword]', ...args)

  useEffect(() => {
    async function init() {
      const code = searchParams.get('code')
      log('URL code:', code)

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        log('exchangeCodeForSession result:', { data, error })

        if (error) {
          setMessage(`Error validating reset link: ${error.message}`)
          return
        }

        if (data.session) {
          setCanReset(true)
          setMessage('Please enter your new password')
          return
        }
      }

      setMessage('Invalid or expired link')
    }

    init()
  }, [searchParams])

  const handleSubmit = async () => {
    log('Attempting password reset')
    if (!canReset) return

    if (!password || password !== confirm) {
      return setMessage('Passwords do not match or empty!')
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    log('updateUser result:', { error })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Password updated. Redirecting…')
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 p-6 rounded shadow">
        <h2>Reset Password</h2>
        <p>{message}</p>

        {canReset && (
          <>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
