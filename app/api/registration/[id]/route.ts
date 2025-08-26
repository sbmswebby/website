// app/api/registration/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = params.id

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })
    }

    // Get registration with all related data
    const { data: registration, error } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        user:user_profiles(*),
        event:events(*),
        session:sessions(*)
      `)
      .eq('id', registrationId)
      .single()

    if (error || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Generate signed URLs for images
    let userPhotoSignedUrl = null
    let eventPhotoSignedUrl = null
    let qrCodeSignedUrl = null

    if (registration.user?.photo_url) {
      const { data } = await supabaseAdmin.storage
        .from('user-photos')
        .createSignedUrl(registration.user.photo_url.replace(/.*\/user-photos\//, ''), 3600)
      userPhotoSignedUrl = data?.signedUrl
    }

    if (registration.event?.photo_url) {
      const { data } = await supabaseAdmin.storage
        .from('event-photos')
        .createSignedUrl(registration.event.photo_url.replace(/.*\/event-photos\//, ''), 3600)
      eventPhotoSignedUrl = data?.signedUrl
    }

    if (registration.qr_code_url) {
      const { data } = await supabaseAdmin.storage
        .from('qrcodes')
        .createSignedUrl(registration.qr_code_url.replace(/.*\/qrcodes\//, ''), 3600)
      qrCodeSignedUrl = data?.signedUrl
    }

    const responseData = {
      registration: {
        id: registration.id,
        reference: registration.reference,
        created_at: registration.created_at,
        payment_status: registration.payment_status
      },
      user: {
        full_name: registration.user.full_name,
        number: registration.user.number,
        photo_url: registration.user.photo_url
      },
      event: {
        name: registration.event.name,
        date: registration.event.date,
        photo_url: registration.event.photo_url
      },
      session: registration.session ? {
        name: registration.session.name,
        start_time: registration.session.start_time,
        end_time: registration.session.end_time,
        cost: registration.session.cost
      } : null,
      qr_code_url: qrCodeSignedUrl,
      assets: {
        user_photo_signed_url: userPhotoSignedUrl,
        event_photo_signed_url: eventPhotoSignedUrl
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Get registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

