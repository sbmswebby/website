import { useState, useEffect } from 'react'
import { Plus, Phone, Mail, MessageCircle, Calendar, User, Filter, Search, ChevronDown } from 'lucide-react'

// Types
interface Lead {
  id: string
  name?: string
  number: string
  insta_id?: string
  source?: string
  created_at: string
  updated_at: string
  lead_interactions: LeadInteraction[]
}

interface LeadInteraction {
  id: string
  lead_id: string
  interaction_type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'follow_up'
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'dead'
  contacted_by: string
  notes?: string
  created_at: string
  follow_up_at?: string
  employee?: {
    full_name: string
  }
}

interface Employee {
  id: string
  full_name: string
  role: string
}


// Define allowed values
type Status = "new" | "contacted" | "qualified" | "converted" | "dead"
type InteractionType = "call" | "email" | "whatsapp" | "meeting" | "follow_up"

// Colors map (typed to only accept Status keys)
const colors: Record<Status, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  dead: "bg-red-100 text-red-800",
}

// Icons map (typed to only accept InteractionType keys)
const icons: Record<InteractionType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Calendar,
  follow_up: User,
}


interface InteractionForm {
  interaction_type: InteractionType
  status: Status
  notes: string
  follow_up_at: string
}

export default function LeadManagement() {
  // State management
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Modal states
  const [showAddLead, setShowAddLead] = useState(false)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // Form states
  const [newLead, setNewLead] = useState({
    name: '',
    number: '',
    insta_id: '',
    source: '',
    notes: ''
  })
  
    const [newInteraction, setNewInteraction] = useState<InteractionForm>({
    interaction_type: "call",
    status: "new",
    notes: "",
    follow_up_at: "",
    })

  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    dateRange: ''
  })
  
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 50,
    hasMore: true
  })

  // Load data on component mount
  useEffect(() => {
    loadLeads()
    loadEmployees()
  }, [])

  // Apply filters when leads or filters change
  useEffect(() => {
    applyFilters()
  }, [leads, filters])

  const loadLeads = async (offset = 0) => {
    setIsLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString()
      })
      
      if (filters.source) {
        params.append('source', filters.source)
      }
      
      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load leads')
      }
      
      if (offset === 0) {
        setLeads(data.leads)
      } else {
        setLeads(prev => [...prev, ...data.leads])
      }
      
      setPagination(prev => ({
        ...prev,
        hasMore: data.leads.length === pagination.limit
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      
      if (response.ok) {
        setEmployees(data.employees)
      }
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...leads]
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(search) ||
        lead.number.includes(search) ||
        lead.insta_id?.toLowerCase().includes(search)
      )
    }
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(lead => {
        const latestInteraction = lead.lead_interactions?.[0]
        return latestInteraction?.status === filters.status
      })
    }
    
    // Source filter
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source)
    }
    
    setFilteredLeads(filtered)
  }

  const handleAddLead = async () => {
    if (!newLead.number) {
      setError('Phone number is required')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lead')
      }
      
      // Add to leads list
      setLeads(prev => [data.lead, ...prev])
      
      // Reset form and close modal
      setNewLead({ name: '', number: '', insta_id: '', source: '', notes: '' })
      setShowAddLead(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInteraction = async () => {
    if (!selectedLead || !newInteraction.notes) {
      setError('Notes are required for interactions')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/lead-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          ...newInteraction,
          follow_up_at: newInteraction.follow_up_at || null
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create interaction')
      }
      
      // Update leads list with new interaction
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id 
          ? {
              ...lead,
              lead_interactions: [data.interaction, ...lead.lead_interactions],
              updated_at: data.interaction.created_at
            }
          : lead
      ))
      
      // Reset form and close modal
      setNewInteraction({
        interaction_type: 'call',
        status: 'new',
        notes: '',
        follow_up_at: ''
      })
      setShowAddInteraction(false)
      setSelectedLead(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interaction')
    } finally {
      setIsLoading(false)
    }
  }

const getStatusBadge = (status: Status) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
    </span>
  )
}

const getInteractionIcon = (type: InteractionType) => {
  const IconComponent = icons[type] ?? User
  return <IconComponent className="w-4 h-4" />
}


  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales leads</p>
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="dead">Dead</option>
          </select>
          
          <select
            value={filters.source}
            onChange={(e) => setFilters({...filters, source: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="social">Social Media</option>
            <option value="referral">Referral</option>
            <option value="event">Event</option>
          </select>
          
          <button
            onClick={() => setFilters({ search: '', status: '', source: '', dateRange: '' })}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Interaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const latestInteraction = lead.lead_interactions?.[0]
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{lead.number}</div>
                          {lead.insta_id && (
                            <div className="text-sm text-gray-500">@{lead.insta_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latestInteraction ? 
                        getStatusBadge(latestInteraction.status) : 
                        getStatusBadge('new')
                      }
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.source || 'Unknown'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {latestInteraction ? (
                        <div>
                          <div className="flex items-center">
                            {getInteractionIcon(latestInteraction.interaction_type)}
                            <span className="ml-2 capitalize">
                              {latestInteraction.interaction_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(latestInteraction.created_at).toLocaleDateString()}
                          </div>
                          {latestInteraction.employee && (
                            <div className="text-xs text-gray-400">
                              by {latestInteraction.employee.full_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No interactions</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowAddInteraction(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Add Interaction
                      </button>
                      <button
                        onClick={() => {/* View details */}}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first lead.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddLead(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </button>
            </div>
          </div>
        )}
        
        {pagination.hasMore && (
          <div className="px-6 py-3 border-t border-gray-200">
            <button
              onClick={() => loadLeads(leads.length)}
              disabled={isLoading}
              className="w-full text-center py-2 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Lead</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newLead.number}
                    onChange={(e) => setNewLead({...newLead, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram ID
                  </label>
                  <input
                    type="text"
                    value={newLead.insta_id}
                    onChange={(e) => setNewLead({...newLead, insta_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select source</option>
                    <option value="website">Website</option>
                    <option value="social">Social Media</option>
                    <option value="referral">Referral</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Notes
                  </label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Add initial notes about this lead..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddLead(false)
                    setNewLead({ name: '', number: '', insta_id: '', source: '', notes: '' })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLead}
                  disabled={!newLead.number || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Add Lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Interaction Modal */}
      {showAddInteraction && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Interaction - {selectedLead.name || selectedLead.number}
              </h3>


              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interaction Type
                  </label>
                    <select
                    value={newInteraction.interaction_type}
                    onChange={(e) =>
                        setNewInteraction({
                        ...newInteraction,
                        interaction_type: e.target.value as InteractionType,
                        })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow-up</option>
                    </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                    <select
                    value={newInteraction.status}
                    onChange={(e) =>
                        setNewInteraction({
                        ...newInteraction,
                        status: e.target.value as Status,
                        })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="dead">Dead</option>
                    </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes *
                  </label>
                  <textarea
                    value={newInteraction.notes}
                    onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Describe the interaction, outcomes, and next steps..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newInteraction.follow_up_at}
                    onChange={(e) => setNewInteraction({...newInteraction, follow_up_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddInteraction(false)
                    setSelectedLead(null)
                    setNewInteraction({
                      interaction_type: 'call',
                      status: 'new',
                      notes: '',
                      follow_up_at: ''
                    })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInteraction}
                  disabled={!newInteraction.notes || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add Interaction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}