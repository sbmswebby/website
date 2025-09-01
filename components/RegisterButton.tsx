'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session as SupabaseSession } from '@supabase/supabase-js';

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    console.log('[RegisterButton] handleRegister started');
    setIsRegistering(true);

    try {
      console.log('[RegisterButton] Fetching session from Supabase');
      const response = await supabase.auth.getSession();
      console.log('[RegisterButton] session response:', response);

      const session: SupabaseSession | null = response.data.session;
      const sessionError = response.error;

      if (sessionError) {
        console.error('[RegisterButton] session error:', sessionError);
        alert('Failed to get session.');
        return;
      }

      if (!session) {
        console.warn('[RegisterButton] No session found');
        alert('Please login to register.');
        return;
      }

      const user = session.user;
      if (!user) {
        console.warn('[RegisterButton] Session exists but no user found');
        alert('Please login to register.');
        return;
      }

      console.log('[RegisterButton] Checking existing registration for user:', user.id, 'session:', sessionId);

      // Use maybeSingle to avoid 406 errors if no row exists
      const { data: existing, error: fetchError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('[RegisterButton] Error checking existing registration:', fetchError);
        alert('Error checking registration.');
        return;
      }

      if (existing) {
        console.warn('[RegisterButton] User already registered for this session:', existing);
        alert('You have already registered for this session.');
        return;
      }

      console.log('[RegisterButton] Proceeding to register user:', user.id, 'for event:', eventId, 'session:', sessionId);

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          session_id: sessionId,
          payment_status: 'pending',
        })
        .select(); // get inserted row

      console.log('[RegisterButton] Insert result:', { data, error });

      if (error) {
        console.error('[RegisterButton] Registration failed:', error.message);
        alert('Registration failed: ' + error.message);
      } else {
        console.log('[RegisterButton] Registration successful!');
        alert('Registered successfully!');
      }
    } catch (err) {
      console.error('[RegisterButton] Unexpected error during registration:', err);
      alert('Registration failed due to an unexpected error.');
    } finally {
      console.log('[RegisterButton] Registration process finished, resetting state');
      setIsRegistering(false);
    }
  };

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      onClick={handleRegister}
      disabled={isRegistering}
    >
      {isRegistering ? 'Registering...' : 'Register'}
    </button>
  );
}
