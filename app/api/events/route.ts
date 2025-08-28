// app/api/events/route.ts

// GET → Retrieves all events (optionally including sessions) ordered by date.


import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeSessions = searchParams.get('include_sessions') === 'true'

    let query = supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (includeSessions) {
      query = supabaseAdmin
        .from('events')
        .select(`
          *,
          sessions(*)
        `)
        .order('date', { ascending: true })
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Events fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
