// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = supabase

    // Get user from session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, number, insta_id, organisation, age, gender, marketing_consent, terms_accepted } = body

    // Validate required fields
    if (!full_name || !number || terms_accepted !== true) {
      return NextResponse.json({ 
        error: 'Missing required fields: full_name, number, terms_accepted' 
      }, { status: 400 })
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const profileData = {
      id: user.id,
      full_name,
      number,
      insta_id: insta_id || null,
      organisation: organisation || null,
      age: age || null,
      gender: gender || null,
      marketing_consent: marketing_consent || false,
      terms_accepted,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()
      result = { data, error }
    } else {
      // Create new profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({ ...profileData, created_at: new Date().toISOString() })
        .select()
        .single()
      result = { data, error }
    }

    if (result.error) {
      console.error('Profile upsert error:', result.error)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: result.data })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

