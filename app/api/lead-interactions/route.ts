// app/api/lead-interactions/route.ts

// POST → Creates a new interaction for a lead, ensuring the user is an employee
//    the lead exists, and updates the lead’s last modified timestamp.

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is employee
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { lead_id, interaction_type, status, notes, follow_up_at } = body

    if (!lead_id || !interaction_type || !status || !notes) {
      return NextResponse.json({ 
        error: 'lead_id, interaction_type, status, and notes are required' 
      }, { status: 400 })
    }

    // Verify lead exists
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create interaction
    const { data: interaction, error: interactionError } = await supabaseAdmin
      .from('lead_interactions')
      .insert({
        lead_id,
        interaction_type,
        status,
        contacted_by: employee.id,
        notes,
        follow_up_at: follow_up_at || null,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        employee:employees(full_name, role)
      `)
      .single()

    if (interactionError) {
      console.error('Interaction creation error:', interactionError)
      return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 })
    }

    // Update lead's updated_at timestamp
    await supabaseAdmin
      .from('leads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', lead_id)

    return NextResponse.json({ interaction })
  } catch (error) {
    console.error('Lead interactions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
