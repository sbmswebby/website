// components/AdminRegistrations.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EventRegistration, UserProfile, Event, Session } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface RegistrationWithDetails extends EventRegistration {
  user_profile: UserProfile
  events: Event
  sessions?: Session
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    checkUserAuth()
  }, [])

  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('Please sign in to access this page.')
        return
      }

      setCurrentUser(user)

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setMessage(`Error fetching user profile: ${profileError.message}`)
        return
      }

      setUserRole(profile.role)

      if (profile.role !== 'admin') {
        setMessage('Access denied. Admin role required.')
        return
      }

      // Fetch registrations if user is admin
      await fetchRegistrations()
    } catch (error: unknown) {
  if (error instanceof Error) {
    setMessage(`Error: ${error.message}`)
  } else {
    setMessage('An unexpected error occurred')
  }
}
finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user_profile:user_id (
            id,
            full_name,
            number,
            insta_id,
            organisation,
            role,
            age,
            gender
          ),
          events:event_id (
            id,
            name,
            description,
            date
          ),
          sessions:session_id (
            id,
            name,
            description,
            start_time,
            end_time,
            cost
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRegistrations(data || [])
    } catch (error: unknown) {
  if (error instanceof Error) {
    setMessage(`Error: ${error.message}`)
  } else {
    setMessage('An unexpected error occurred')
  }
}

  }

  const updatePaymentStatus = async (registrationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ payment_status: newStatus })
        .eq('id', registrationId)

      if (error) throw error

      // Refresh the data
      await fetchRegistrations()
      setMessage('Payment status updated successfully!')
    } catch (error: unknown) {
  if (error instanceof Error) {
    setMessage(`Error: ${error.message}`)
  } else {
    setMessage('An unexpected error occurred')
  }
}

  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-100 rounded-lg">
        <p className="text-red-700">{message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Registrations</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.user_profile.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.user_profile.number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.user_profile.organisation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.events.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(registration.events.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {registration.sessions ? registration.sessions.name : 'No session'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      registration.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : registration.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {registration.payment_status || 'Not set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {registration.reference || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.created_at 
                      ? new Date(registration.created_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={registration.payment_status || ''}
                      onChange={(e) => updatePaymentStatus(registration.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {registrations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No registrations found.</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-sm text-gray-600">
          Total Registrations: {registrations.length}
        </p>
        <p className="text-sm text-gray-600">
          Paid: {registrations.filter(r => r.payment_status === 'paid').length}
        </p>
        <p className="text-sm text-gray-600">
          Pending: {registrations.filter(r => r.payment_status === 'pending').length}
        </p>
      </div>
    </div>
  )
}