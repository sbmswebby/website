// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, session_id, reference, marketing_consent } = body

    // Validate required fields
    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 })
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found. Please complete your profile first.' }, { status: 400 })
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify session if provided
    let session = null
    if (session_id) {
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .eq('event_id', event_id)
        .single()

      if (sessionError || !sessionData) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      session = sessionData
    }

    // Check for duplicate registration
    const { data: existingReg } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .eq('session_id', session_id || null)
      .single()

    if (existingReg) {
      return NextResponse.json({ error: 'Already registered for this event/session' }, { status: 400 })
    }

    // Generate registration reference if not provided
    const registrationRef = reference || `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create registration record
    const registrationId = uuidv4()
    const { data: registration, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        id: registrationId,
        user_id: user.id,
        event_id,
        session_id: session_id || null,
        reference: registrationRef,
        payment_status: session?.cost > 0 ? 'pending' : 'completed',
        marketing_consent: marketing_consent !== undefined ? marketing_consent : profile.marketing_consent,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (regError) {
      console.error('Registration error:', regError)
      return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 })
    }

    // Generate QR code
    const qrData = `${registrationId}:${Buffer.from(`${registrationId}-${registrationRef}`).toString('base64')}`
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 256,
      margin: 2
    })

    // Upload QR code to Supabase Storage
    const qrFileName = `qrcodes/${registrationId}.png`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('qrcodes')
      .upload(qrFileName, qrCodeBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('QR upload error:', uploadError)
      // Continue without QR code - can be generated later
    }

    // Update registration with QR code URL
    let qrCodeUrl = null
    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from('qrcodes')
        .getPublicUrl(qrFileName)
      qrCodeUrl = urlData.publicUrl

      await supabaseAdmin
        .from('event_registrations')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', registrationId)
    }

    // Return registration data with related info
    const responseData = {
      registration: {
        ...registration,
        qr_code_url: qrCodeUrl
      },
      event,
      session,
      payment_required: session?.cost > 0,
      upi_link: session?.upi_link
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

