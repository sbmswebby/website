import { useState, useEffect } from 'react'
import { Camera, Upload, Check, Clock, Users, MapPin } from 'lucide-react'

// Types
interface Event {
  id: string
  name: string
  description?: string
  date: string
  photo_url?: string
}

interface Session {
  id: string
  event_id: string
  name: string
  description?: string
  start_time: string
  end_time: string
  cost: number
  currency: string
}

interface UserProfile {
  id?: string
  full_name: string
  number: string
  insta_id?: string
  organisation?: string
  age?: number
  gender?: string
  photo_url?: string
  marketing_consent: boolean
  terms_accepted: boolean
}

type RegistrationData = {
  registration: {
    id: string
    reference: string
  }
  payment_required: boolean
  session?: {
    cost: number
  }
  upi_link?: string
}

export default function RegistrationForm() {
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [events, setEvents] = useState<Event[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    number: '',
    insta_id: '',
    organisation: '',
    age: undefined,
    gender: '',
    marketing_consent: true,
    terms_accepted: false
  })

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Registration state
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [reference, setReference] = useState('')

  // Load events on component mount
  useEffect(() => {
    loadEvents()
    
    // Check for reference parameter
    const urlParams = new URLSearchParams(window.location.search)
    const refParam = urlParams.get('ref')
    if (refParam) {
      setReference(refParam)
    }
  }, [])

  // Load existing user profile
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events?include_sessions=true')
      const data = await response.json()
      
      if (response.ok) {
        setEvents(data.events)
      } else {
        setError('Failed to load events')
      }
    } catch (err) {
      setError('Failed to load events')
    }
  }

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        if (data.profile.photo_url) {
          setPhotoPreview(data.profile.photo_url)
        }
      }
    } catch (err) {
      // User might not have a profile yet
      console.log('No existing profile found')
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    // Load sessions for this event
    const eventSessions = sessions.filter(s => s.event_id === event.id)
    setSessions(eventSessions)
    setSelectedSession(null)
  }

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session)
  }

  const handlePhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Photo size must be less than 5MB')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image')
      return
    }

    setPhotoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
  }

  const handleProfileSubmit = async () => {
    if (!profile.full_name || !profile.number || !profile.terms_accepted) {
      setError('Please fill all required fields and accept terms')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Save profile first
      const profileResponse = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      // Upload photo if selected
      if (photoFile) {
        setUploadingPhoto(true)
        const formData = new FormData()
        formData.append('photo', photoFile)
        
        const photoResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: formData
        })

        if (!photoResponse.ok) {
          console.warn('Photo upload failed, continuing without photo')
        }
        setUploadingPhoto(false)
      }

      setCurrentStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegistrationSubmit = async () => {
    if (!selectedEvent) {
      setError('Please select an event')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const registrationPayload = {
        event_id: selectedEvent.id,
        session_id: selectedSession?.id || null,
        reference: reference || undefined,
        marketing_consent: profile.marketing_consent
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setRegistrationData(data)
      setSuccess(true)
      setCurrentStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!registrationData) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/registration/${registrationData.registration.id}`)
      const pdfData = await response.json()

      // Use pdf-lib to generate PDF (implementation would go here)
      console.log('PDF Data:', pdfData)
      // For now, just show success message
      alert('PDF generation would happen here with the fetched data')
    } catch (err) {
      setError('Failed to generate PDF')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
          <p className="text-green-700 mb-4">
            Your registration reference: <strong>{registrationData?.registration?.reference}</strong>
          </p>
          
          {registrationData?.payment_required && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">Payment Required</p>
              <p className="text-yellow-700">
                Amount: ₹{registrationData.session?.cost}
              </p>
              {registrationData.upi_link && (
                <a 
                  href={registrationData.upi_link}
                  className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pay Now
                </a>
              )}
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={generatePDF}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Download Pass'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Profile Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
          
          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </label>
                {uploadingPhoto && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={profile.number}
                onChange={(e) => setProfile({...profile, number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram ID
              </label>
              <input
                type="text"
                value={profile.insta_id || ''}
                onChange={(e) => setProfile({...profile, insta_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={profile.organisation || ''}
                onChange={(e) => setProfile({...profile, organisation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Company/College name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="25"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={profile.gender || ''}
                onChange={(e) => setProfile({...profile, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Reference Field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Code (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter reference code if you have one"
            />
          </div>

          {/* Consent Checkboxes */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="marketing-consent"
                checked={profile.marketing_consent}
                onChange={(e) => setProfile({...profile, marketing_consent: e.target.checked})}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="marketing-consent" className="ml-3 text-sm text-gray-700">
                I agree to receive marketing communications and updates about future events
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms-consent"
                checked={profile.terms_accepted}
                onChange={(e) => setProfile({...profile, terms_accepted: e.target.checked})}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms-consent" className="ml-3 text-sm text-gray-700">
                I accept the <a href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms & Conditions</a> and <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a> *
              </label>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleProfileSubmit}
              disabled={isLoading || !profile.terms_accepted}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving Profile...' : 'Continue to Events'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Event Selection */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Event & Session</h2>
          
          {/* Events Grid */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Available Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedEvent?.id === event.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {event.photo_url && (
                    <img
                      src={event.photo_url}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h4>
                  {event.description && (
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>

                  {selectedEvent?.id === event.id && (
                    <div className="mt-4 flex items-center text-indigo-600">
                      <Check className="w-5 h-5 mr-2" />
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sessions for Selected Event */}
            {selectedEvent && sessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Sessions for {selectedEvent.name}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSession?.id === session.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{session.name}</h5>
                          {session.description && (
                            <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(session.start_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(session.end_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {session.cost > 0 ? (
                            <div className="text-lg font-semibold text-gray-900">
                              ₹{session.cost}
                            </div>
                          ) : (
                            <div className="text-lg font-semibold text-green-600">
                              Free
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedSession?.id === session.id && (
                        <div className="mt-3 flex items-center text-indigo-600">
                          <Check className="w-4 h-4 mr-2" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Profile
            </button>
            <button
              onClick={handleRegistrationSubmit}
              disabled={!selectedEvent || isLoading}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}