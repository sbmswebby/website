import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;


// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Types for database schema
export interface UserProfile {
  id: string
  full_name: string
  number: string
  insta_id?: string
  organisation?: string
  role: 'attendee' | 'admin' | 'employee'
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  photo_url?: string
  marketing_consent: boolean
  terms_accepted: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  description?: string
  date: string
  photo_url?: string
  created_at: string
}

export interface Session {
  id: string
  event_id: string
  name: string
  description?: string
  start_time: string
  end_time: string
  cost: number
  currency: string
  upi_link?: string
  created_at: string
  event?: Event
}

export interface EventRegistration {
  id: string
  user_id: string
  event_id: string
  session_id?: string
  reference: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  qr_code_url?: string
  marketing_consent?: boolean
  created_at: string
  user?: UserProfile
  event?: Event
  session?: Session
}

export interface Lead {
  id: string
  name?: string
  number: string
  insta_id?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  full_name: string
  role: 'sales' | 'marketing' | 'admin' | 'manager'
  auth_id?: string
}

export interface LeadInteraction {
  id: string
  lead_id: string
  interaction_type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'follow_up'
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'dead'
  contacted_by: string
  notes?: string
  created_at: string
  follow_up_at?: string
  lead?: Lead
  employee?: Employee
}