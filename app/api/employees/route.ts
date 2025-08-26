
// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, role')
      .order('full_name')

    if (error) {
      console.error('Employees fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

