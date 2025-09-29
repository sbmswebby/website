'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/shared/AuthProvider'

/** Profile type definition */
export type Profile = {
  full_name: string
  number: string
  insta_id: string
  organisation: string
  age: string
  gender: string
}

/** Message type for success/error feedback */
type Message = { type: 'success' | 'error'; text: string } | null

/**
 * UserProfileForm component
 * Handles fetching, displaying, and updating a user's profile.
 */
export default function UserProfileForm() {
  const { user } = useAuth()

  // Local state for form fields
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    number: '',
    insta_id: '',
    organisation: '',
    age: '',
    gender: '',
  })

  // Loading and feedback states
  const [fetching, setFetching] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [message, setMessage] = useState<Message>(null)

  /** Fetch profile when `user.id` becomes available */
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
      } catch (err: unknown) {
        console.error(err)
        setMessage({ type: 'error', text: 'Failed to load user profile.' })
      } finally {
        setFetching(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  /** Handles form submission and updates the profile in Supabase */
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

  return (
    <div className="space-y-6">
      {/* Feedback messages */}
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

      {/* Fetching indicator */}
      {fetching && (
        <div className="text-gray-400 text-sm mb-2">Refreshing profile…</div>
      )}

      {/* Profile update form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <input
              id="number"
              type="tel"
              value={profile.number}
              onChange={(e) => setProfile({ ...profile, number: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
            />
          </div>

          {/* Instagram ID */}
          <div>
            <label htmlFor="insta_id" className="block text-sm font-medium text-gray-300">
              Instagram ID
            </label>
            <input
              id="insta_id"
              type="text"
              value={profile.insta_id}
              onChange={(e) => setProfile({ ...profile, insta_id: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
            />
          </div>

          {/* Organisation */}
          <div>
            <label htmlFor="organisation" className="block text-sm font-medium text-gray-300">
              Organisation
            </label>
            <input
              id="organisation"
              type="text"
              value={profile.organisation}
              onChange={(e) => setProfile({ ...profile, organisation: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300">
              Age
            </label>
            <input
              id="age"
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-gray-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
              Gender
            </label>
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

        {/* Submit button */}
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
    </div>
  )
}
