// components/AdminDashboard.tsx

'use client';
import { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Download, 
  Filter,
  Search,
  Eye,
  BarChart3,
  UserCheck,
  Clock,
  DollarSign
} from 'lucide-react'

// Types for related entities
interface RegistrationUser {
  full_name: string | null
}

interface RegistrationEvent {
  name: string | null
}

interface Registration {
  id: string
  user?: RegistrationUser
  event?: RegistrationEvent
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: string
}

interface Lead {
  id: string
  name: string | null
  number: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  updated_at: string
}

interface Event {
  id: string
  title: string
  date: string
  location: string
  description?: string
}

// DashboardStats with strong types
interface DashboardStats {
  totalRegistrations: number
  totalLeads: number
  totalEvents: number
  totalRevenue: number
  recentRegistrations: Registration[]
  recentLeads: Lead[]
  upcomingEvents: Event[]
  registrationsByStatus: {
    pending: number
    completed: number
    failed: number
  }
  leadsByStatus: {
    new: number
    contacted: number
    qualified: number
    converted: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/dashboard/stats?range=${dateRange}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard data')
      }
      
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (type: 'registrations' | 'leads') => {
    try {
      const response = await fetch(`/api/reports/${type}?format=csv&range=${dateRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to download report')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Event registration and lead management overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={() => downloadReport('registrations')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 text-sm font-medium">+12% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 text-sm font-medium">+8% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-gray-600 text-sm">{stats.upcomingEvents.length} upcoming</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 text-sm font-medium">+15% vs last period</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'registrations', label: 'Registrations', icon: UserCheck },
            { id: 'leads', label: 'Leads', icon: Users },
            { id: 'events', label: 'Events', icon: Calendar }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.registrationsByStatus.completed / stats.totalRegistrations) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.registrationsByStatus.completed}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.registrationsByStatus.pending / stats.totalRegistrations) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.registrationsByStatus.pending}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.registrationsByStatus.failed / stats.totalRegistrations) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.registrationsByStatus.failed}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.leadsByStatus.new / stats.totalLeads) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.leadsByStatus.new}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contacted</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.leadsByStatus.contacted / stats.totalLeads) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.leadsByStatus.contacted}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qualified</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.leadsByStatus.qualified / stats.totalLeads) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.leadsByStatus.qualified}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Converted</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.leadsByStatus.converted / stats.totalLeads) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {stats.leadsByStatus.converted}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Registrations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
            <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {stats.recentRegistrations.slice(0, 5).map((registration, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {registration.user?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {registration.event?.name || 'Unknown Event'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    registration.payment_status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : registration.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {registration.payment_status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(registration.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {stats.recentLeads.slice(0, 5).map((lead, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name || 'No Name'}
                    </p>
                    <p className="text-xs text-gray-500">{lead.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'converted' 
                      ? 'bg-green-100 text-green-800'
                      : lead.status === 'qualified'
                      ? 'bg-purple-100 text-purple-800'
                      : lead.status === 'contacted'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {lead.status || 'new'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}