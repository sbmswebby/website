// components/EventRegistration.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Event, Session } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface EventWithSessions extends Event {
  sessions: Session[]
}

export default function EventRegistration() {
  const [events, setEvents] = useState<EventWithSessions[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    checkUserAuth()
    fetchEvents()
  }, [])

  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Please sign in to register for events.')
        return
      }
      setCurrentUser(user)
    } catch (error: unknown) {
		if (error instanceof Error) {
				setMessage(`Error: ${error.message}`)
		} else {
				setMessage('An unexpected error occurred')
		}
	}
  }

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          sessions (*)
        `)
        .order('date', { ascending: true })

      if (eventsError) throw eventsError

      setEvents(eventsData || [])
    } catch (error: unknown) {
		if (error instanceof Error) {
				setMessage(`Error: ${error.message}`)
		} else {
				setMessage('An unexpected error occurred')
		}
		}finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setMessage('Please sign in first.')
      return
    }

    if (!selectedEvent) {
      setMessage('Please select an event.')
      return
    }

    setRegistering(true)
    setMessage('')

    try {
      // Check if user is already registered for this event
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', selectedEvent)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingRegistration) {
        setMessage('You are already registered for this event.')
        setRegistering(false)
        return
      }

      // Create registration
      const registrationData = {
        user_id: currentUser.id,
        event_id: selectedEvent,
        session_id: selectedSession || null,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        marketing_consent: false
      }

      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert(registrationData)

      if (registrationError) throw registrationError

      setMessage('Successfully registered for the event!')
      setSelectedEvent('')
      setSelectedSession('')
    } catch (error: unknown) {
		if (error instanceof Error) {
				setMessage(`Error: ${error.message}`)
		} else {
				setMessage('An unexpected error occurred')
		}
		} finally {
      setRegistering(false)
    }
  }

  const selectedEventData = events.find(e => e.id === selectedEvent)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-100 rounded-lg">
        <p className="text-yellow-700">{message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register for Events</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-gray-700">Select Event</label>
          <select
            id="event"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value)
              setSelectedSession('')
            }}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Choose an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEventData && selectedEventData.sessions && selectedEventData.sessions.length > 0 && (
          <div>
            <label htmlFor="session" className="block text-sm font-medium text-gray-700">Select Session (Optional)</label>
            <select
              id="session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No specific session</option>
              {selectedEventData.sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} {session.cost ? `- ₹${session.cost}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEventData && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg">{selectedEventData.name}</h3>
            <p className="text-gray-600">{selectedEventData.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Date: {new Date(selectedEventData.date).toLocaleDateString()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={registering || !selectedEvent}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {registering ? 'Registering...' : 'Register for Event'}
        </button>
      </form>

      {events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No events available for registration.</p>
        </div>
      )}
    </div>
  )
}