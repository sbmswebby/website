'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import ForgotPassword from '@/components/ForgotPassword'
import EventRegistrations from '@/components/EventRegistrations'

type Profile = {
  full_name: string
  number: string
  insta_id: string
  organisation: string
  age: string
  gender: string
}

type Message = { type: 'success' | 'error'; text: string } | null

export default function UserProfile() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    number: '',
    insta_id: '',
    organisation: '',
    age: '',
    gender: '',
  })

  const [fetching, setFetching] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<Message>(null)

  // ✅ Fetch profile once user.id is available
  useEffect(() => {
    if (!user?.id) return
    const fetchProfile = async () => {
      setFetching(true)
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (error) throw error
        if (data) {
          setProfile({
            full_name: data.full_name ?? '',
            number: data.number ?? '',
            insta_id: data.insta_id ?? '',
            organisation: data.organisation ?? '',
            age: data.age ?? '',
            gender: data.gender ?? '',
          })

        }
      } catch (err) {
        console.error(err)
        setMessage({ type: 'error', text: 'Failed to load user profile.' })
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [user?.id])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setUpdating(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('id', user.id)
      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setMessage({ type: 'error', text: `Failed to update: ${err.message}` })
      } else {
        setMessage({ type: 'error', text: 'Failed to update: Unknown error' })
      }
    } finally {
      setUpdating(false)
    }
  }

  if (!user) {
    return (
      <div className="flex  justify-center items-center min-h-screen text-red-400 p-4">
        You are not logged in. Please log in to view this page.
      </div>
    )
  }

  return (
    <div id="signUp" className="flex flex-col items-center justify-center p-4 m-12 sm:p-12 min-h-screen bg-transparent">
      <div className="w-full max-w-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">User Profile</h2>
          <p className="mt-2 text-sm text-gray-400">View and update your personal information.</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border ${
              message.type === 'error'
                ? 'bg-red-900 bg-opacity-30 text-red-300 border-red-800'
                : 'bg-green-900 bg-opacity-30 text-green-300 border-green-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {fetching && (
          <div className="text-gray-400 text-sm mb-2">Refreshing profile…</div>
        )}

        {/* Profile form */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-300">Phone Number</label>
              <input
                id="number"
                type="tel"
                value={profile.number}
                onChange={(e) => setProfile({ ...profile, number: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="insta_id" className="block text-sm font-medium text-gray-300">Instagram ID</label>
              <input
                id="insta_id"
                type="text"
                value={profile.insta_id}
                onChange={(e) => setProfile({ ...profile, insta_id: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-300">Organisation</label>
              <input
                id="organisation"
                type="text"
                value={profile.organisation}
                onChange={(e) => setProfile({ ...profile, organisation: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300">Age</label>
              <input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-300">Gender</label>
              <select
                id="gender"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Update Profile'}
            </button>
          </div>
        </form>
        <ForgotPassword ></ForgotPassword>
      </div>
      
      <EventRegistrations />
    </div>
  )
}
