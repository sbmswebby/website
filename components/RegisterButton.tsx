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
    setIsRegistering(true);
    try {
      // Get session from Supabase
      const response = await supabase.auth.getSession();
      const session: SupabaseSession | null = response.data.session;
      const sessionError = response.error;

      if (sessionError) {
        console.error(sessionError);
        alert('Failed to get session.');
        return;
      }

      if (!session) {
        alert('Please login to register.');
        return;
      }

      const user = session.user;
      if (!user) {
        alert('Please login to register.');
        return;
      }

      const { error } = await supabase.from('event_registrations').insert({
        user_id: user.id,
        event_id: eventId,
        session_id: sessionId,
        payment_status: 'pending',
      });

      if (error) {
        console.error('Registration failed:', error.message);
        alert('Registration failed: ' + error.message);
      } else {
        alert('Registered successfully!');
      }
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      alert('Registration failed due to an unexpected error.');
    } finally {
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
