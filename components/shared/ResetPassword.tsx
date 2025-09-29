'use client'

import { supabase } from '@/lib/supabaseClient'
import React, { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('Validating reset link…')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // ✅ Wait for Supabase session after recovery link
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setSessionReady(true)
        setMessage('Please enter your new password')
      } else {
        // listen for auth event (happens after redirect)
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setSessionReady(true)
            setMessage('Please enter your new password')
          } else {
            setMessage('Invalid or expired link')
          }
        })
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionReady) return

    if (!password || password !== confirm) {
      setError('Passwords do not match or are empty!')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setMessage('✅ Password updated. Redirecting…')
        setLoading(false)
        setTimeout(() => router.push('/'), 1200)
      }
} catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message)
  } else {
    setError('Something went wrong')
  }
  setLoading(false)
}
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        id="signIn"
        className="min-h-screen flex items-center justify-center bg-gray-900"
      >
        <div className="w-full max-w-md bg-[rgba(10,10,10,0.95)] backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Reset Password
            </h2>
            <p className="text-gray-300 mt-2">{message}</p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 text-red-300 p-4 rounded-xl text-sm border border-red-800">
              {error}
            </div>
          )}

          {sessionReady && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Suspense>
  )
}
