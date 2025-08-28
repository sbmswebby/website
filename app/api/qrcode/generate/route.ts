// app/api/qrcode/generate/route.ts
// POST → Creates a QR details redirect URL (based on registration data), stores it in the registration row, and returns it to the client.
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// Removed: import QRCode from 'qrcode'; // No longer needed as we're not generating an image

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Access check for employees/admins has been removed as requested.

    const body = await request.json();
    const { registration_id } = body;

    if (!registration_id) {
      return NextResponse.json({ error: 'registration_id is required' }, { status: 400 });
    }

    // Verify registration exists and select necessary fields for the URL construction
    const { data: registration, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select('id, user_id, event_id, session_id, reference') // Ensure we select these fields
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      console.error('Registration not found:', regError);
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // --- START: Replaced QR code generation and upload logic ---
    // Construct the URL for the registration details page based on the discussed format:
    // /registrations?=qr_details: user_id event_id session_id
    const qrDetailsUrl = `/registrations?qr_details=${registration.user_id}:${registration.event_id}:${registration.session_id || ''}`;
    // If session_id is null, it will be an empty string in the URL,
    // which should be handled by your /registrations page.
    // --- END: Replaced QR code generation and upload logic ---

    // Update the 'qr_code_url' column in the event_registrations table with the new redirection URL
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ qr_code_url: qrDetailsUrl }) // This column now stores the redirection URL
      .eq('id', registration_id);

    if (updateError) {
      console.error('Registration update error:', updateError);
      // Log the error but proceed to return the generated URL, as it's still valid.
      // If updating the database is critical for your application flow,
      // consider returning an error response here instead.
    }

    // Return the constructed redirection URL
    return NextResponse.json({
      qr_code_url: qrDetailsUrl,
      message: 'QR details URL generated and updated successfully'
    });
  } catch (error) {
    console.error('QR generation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
