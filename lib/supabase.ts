// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on your schema
export interface UserProfile {
  id: string
  full_name: string
  number: string
  insta_id?: string
  organisation?: string
  role: string
  age?: number
  gender?: string
  photo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Event {
  id: string
  name: string
  description?: string
  date: string
  photo_url?: string
  created_at?: string
}

export interface Session {
  id: string
  event_id: string
  name: string
  description?: string
  start_time?: string
  end_time?: string
  cost?: number
  upi_link?: string
  created_at?: string
}

export interface EventRegistration {
  id: string
  user_id: string
  event_id: string
  session_id?: string
  reference?: string
  payment_status?: string
  qr_code_url?: string
  created_at?: string
  marketing_consent?: boolean
}