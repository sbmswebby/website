// app/api/register/route.ts

// this route handles the submmision of all the registrations of sessions(sub_events)


import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Removed: import QRCode from 'qrcode'; // No longer needed
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, session_id, reference, marketing_consent } = body;

    // Validate required fields
    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found. Please complete your profile first.' }, { status: 400 });
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify session if provided
    let session = null;
    if (session_id) {
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .eq('event_id', event_id)
        .single();

      if (sessionError || !sessionData) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      session = sessionData;
    }

    // Check for duplicate registration
    const { data: existingReg } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .eq('session_id', session_id || null)
      .single();

    if (existingReg) {
      return NextResponse.json({ error: 'Already registered for this event/session' }, { status: 400 });
    }

    // Generate registration reference if not provided
    const registrationRef = reference || `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate a UUID for the registration ID
    const registrationId = uuidv4();

    // Create registration record with a placeholder for qr_code_url
    const { data: initialRegistration, error: regError } = await supabaseAdmin
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
      .single();

    if (regError || !initialRegistration) {
      console.error('Registration error:', regError);
      return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }

    // --- START: Replaced QR code generation and upload logic ---
    // Construct the URL with the desired parameters
    const qrDetailsUrl = `/registrations?qr_details=${initialRegistration.id}:${event_id}:${session_id || ''}`;
    // You might want to ensure 'session_id' is an empty string if null, or omit it if not present,
    // depending on how you parse it on the /registrations page.

    // Update the registration with the new URL
    const { data: updatedRegistration, error: updateUrlError } = await supabaseAdmin
      .from('event_registrations')
      .update({ qr_code_url: qrDetailsUrl }) // This column will now store the redirection URL
      .eq('id', initialRegistration.id)
      .select()
      .single();

    if (updateUrlError) {
      console.error('Failed to update registration with QR details URL:', updateUrlError);
      // Decide if you want to proceed without the URL or return an error
      // For now, we'll log and continue, similar to the original QR upload error handling.
    }
    // --- END: Replaced QR code generation and upload logic ---

    // Return registration data with related info
    const responseData = {
      registration: {
        ...initialRegistration, // Use initial registration data
        qr_code_url: updatedRegistration ? updatedRegistration.qr_code_url : qrDetailsUrl // Use updated URL if successful, otherwise the constructed one
      },
      event,
      session,
      payment_required: session?.cost > 0,
      upi_link: session?.upi_link
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
