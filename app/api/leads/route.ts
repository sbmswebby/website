
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

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
    const { name, number, insta_id, source, notes } = body

    if (!number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Check for duplicate phone number
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('number', number)
      .single()

    if (existingLead) {
      return NextResponse.json({ error: 'Lead with this phone number already exists' }, { status: 400 })
    }

    // Create lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        name: name || null,
        number,
        insta_id: insta_id || null,
        source: source || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (leadError) {
      console.error('Lead creation error:', leadError)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Create initial interaction if notes provided
    if (notes) {
      await supabaseAdmin
        .from('lead_interactions')
        .insert({
          lead_id: lead.id,
          interaction_type: 'follow_up',
          status: 'new',
          contacted_by: employee.id,
          notes,
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Leads API error:', error)
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

    // Verify user is employee
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const source = searchParams.get('source')

    let query = supabaseAdmin
      .from('leads')
      .select(`
        *,
        lead_interactions(
          *,
          employee:employees(full_name)
        )
      `)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (source) {
      query = query.eq('source', source)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Leads fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}