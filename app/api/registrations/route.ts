
// app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if user is employee (can see all registrations)
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    const isEmployee = !!employee

    let query = supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        user:user_profiles(id, full_name, number, insta_id, organisation),
        event:events(id, name, date, photo_url),
        session:sessions(id, name, start_time, end_time, cost, currency)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on user role
    if (!isEmployee) {
      // Regular users can only see their own registrations
      query = query.eq('user_id', user.id)
    } else {
      // Employees can filter by userId if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }
    }

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (status) {
      query = query.eq('payment_status', status)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Registrations fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
    }

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Registrations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
