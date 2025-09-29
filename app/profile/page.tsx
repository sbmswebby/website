'use client'
import React from 'react'
import { useAuth } from '@/components/shared/AuthProvider'
import ForgotPassword from '@/components/shared/ForgotPassword'
import EventRegistrations from '@/components/shared/UserRegistrations'
import UserProfileForm from '@/components/shared/profile_page'

/**
 * UserProfile page
 * Wrapper component that shows the user profile form + extra features
 */
export default function UserProfile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400 p-4">
        You are not logged in. Please log in to view this page.
      </div>
    )
  }

  return (
    <div
      id="signUp"
      className="flex flex-col items-center justify-center p-4 m-12 sm:p-12 min-h-screen bg-transparent"
    >
      <div className="w-full max-w-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">User Profile</h2>
          <p className="mt-2 text-sm text-gray-400">
            View and update your personal information.
          </p>
        </div>

        {/* Profile Form Component */}
        <UserProfileForm />

        {/* Forgot Password */}
        <ForgotPassword />
      </div>

      {/* Event Registrations */}
      <EventRegistrations />
    </div>
  )
}
