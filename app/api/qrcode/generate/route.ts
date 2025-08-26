
// app/api/qrcode/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is employee/admin
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!employee && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { registration_id } = body

    if (!registration_id) {
      return NextResponse.json({ error: 'registration_id is required' }, { status: 400 })
    }

    // Verify registration exists
    const { data: registration, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', registration_id)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Generate QR code with verification hash
    const qrData = `${registration_id}:${Buffer.from(`${registration_id}-${registration.reference}`).toString('base64')}`
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Upload QR code to Supabase Storage
    const qrFileName = `qrcodes/${registration_id}.png`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('qrcodes')
      .upload(qrFileName, qrCodeBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('QR upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload QR code' }, { status: 500 })
    }

    // Get signed URL for immediate access
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('qrcodes')
      .createSignedUrl(qrFileName, 3600) // 1 hour expiry

    if (urlError) {
      console.error('QR URL error:', urlError)
      return NextResponse.json({ error: 'Failed to generate QR code URL' }, { status: 500 })
    }

    // Update registration record
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ qr_code_url: urlData.signedUrl })
      .eq('id', registration_id)

    if (updateError) {
      console.error('Registration update error:', updateError)
      // Continue with success even if update fails
    }

    return NextResponse.json({
      qr_code_url: urlData.signedUrl,
      message: 'QR code generated successfully'
    })
  } catch (error) {
    console.error('QR generation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}