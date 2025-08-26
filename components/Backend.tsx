'use client';

import { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react'

// Import your components
import { useAuth } from './auth/AuthProvider'
import AdminDashboard from './AdminDashboard'
import RegistrationForm from './RegistrationForm'
import LeadManagement from './LeadsDashboard';


interface AppLayoutProps {
  children?: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      id: 'dashboard',
      icon: Home,
      roles: ['admin', 'employee']
    },
    {
      name: 'Register for Event',
      id: 'register',
      icon: Calendar,
      roles: ['attendee', 'admin', 'employee']
    },
    {
      name: 'Lead Management',
      id: 'leads',
      icon: Users,
      roles: ['admin', 'employee']
    },
    {
      name: 'Registrations',
      id: 'registrations',
      icon: UserCheck,
      roles: ['admin', 'employee']
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: Settings,
      roles: ['admin', 'employee', 'attendee']
    }
  ]

  // Filter navigation based on user role
  const allowedNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role || 'attendee')
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />
      case 'register':
        return <RegistrationForm />
      case 'leads':
        return <LeadManagement />
      case 'registrations':
        return <RegistrationsList />
      case 'settings':
        return <UserSettings />
      default:
        return children || <AdminDashboard />
    }
  }

  return (
    <div className="h-screen flex">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">SBMS</span>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {allowedNavigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setCurrentView(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left ${
                      currentView === item.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="mr-4 h-6 w-6 flex-shrink-0" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
            <div className="flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">
                    {profile?.full_name || user?.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">SBMS</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {allowedNavigation.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => setCurrentView(item.id)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </button>
              )
            })}
          </nav>
          <div className="flex-shrink-0 px-4 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {profile?.photo_url ? (
                    <img 
                      src={profile.photo_url} 
                      alt="Profile" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role || 'User'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            {/* Search bar */}
            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-lg lg:max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            {/* Right side items */}
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Mobile user menu */}
              <div className="lg:hidden">
                <button
                  onClick={handleSignOut}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  )
}

// Simple components for missing views
function RegistrationsList() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Registrations</h1>
      <div className="bg-white shadow-sm rounded-lg border p-8 text-center">
        <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Management</h3>
        <p className="text-gray-500">
          View and manage all event registrations, payment status, and attendee details.
        </p>
        <div className="mt-6">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}

function UserSettings() {
  const { profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const handleUpdateProfile = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Profile update logic would go here
      await refreshProfile()
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-500">
                Update your personal information and preferences.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('success') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue={profile?.number || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  defaultValue={profile?.organisation || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketing-consent"
                  defaultChecked={profile?.marketing_consent || false}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="marketing-consent" className="ml-2 text-sm text-gray-700">
                  Receive marketing communications
                </label>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {profile?.role || 'User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.created_at ? 
                    new Date(profile.created_at).toLocaleDateString() : 
                    'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Download My Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Change Password
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}