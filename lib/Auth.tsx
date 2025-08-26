// lib/auth.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: Partial<ResponseCookie>) {
          // ⚠️ cookieStore is read-only on the server,
          // so calling set() here won’t actually persist cookies.
          // In practice, handle this in API routes/middleware.
          (await cookieStore).set({ name, value, ...options });
        },
        async remove(name: string, options: Partial<ResponseCookie>) {
          (await cookieStore).set({ name, value: "", maxAge: 0, ...options });
        },
      },
    }
  );
}

// Authentication middleware for API routes
export async function requireAuth(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return { user, supabase }
}

// Check if user has specific role
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user, supabase } = authResult
  
  // Get user profile to check role
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error || !profile || !allowedRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return { user, supabase, profile }
}

// Check if user is employee
export async function requireEmployee(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user, supabase } = authResult
  
  // Check if user is in employees table
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_id', user.id)
    .single()
  
  if (error || !employee) {
    return NextResponse.json({ error: 'Employee access required' }, { status: 403 })
  }
  
  return { user, supabase, employee }
}

