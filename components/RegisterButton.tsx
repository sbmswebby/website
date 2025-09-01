'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
  eventName?: string; // optional, for PDF display
}

export default function RegisterButton({ eventId, sessionId, eventName }: RegisterButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Check if the user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user: SupabaseSession['user'] | null = sessionData.session?.user || null;
        if (!user) return;

        const { data: existing } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('user_id', user.id)
          .eq('session_id', sessionId)
          .maybeSingle();

        if (existing?.id) {
          setIsRegistered(true);
          setRegistrationId(existing.id);
        }
      } catch (err) {
        console.error('[RegisterButton] Error checking registration:', err);
      }
    };

    checkRegistration();
  }, [sessionId]);

  const generatePdfTicket = async (regId: string) => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(eventName || 'Event Ticket', 20, 30);

    const qrUrl = `https://sbms.com/registration?event_registration_id=${regId}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    pdf.addImage(qrDataUrl, 'PNG', 20, 50, 50, 50); // x, y, width, height
    pdf.setFontSize(12);
    pdf.text(`Registration ID: ${regId}`, 20, 110);

    pdf.save(`Ticket-${regId}.pdf`);
  };

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session: SupabaseSession | null = sessionData.session;
      if (!session || !session.user) {
        alert('Please login to register.');
        return;
      }
      const user = session.user;

      // Check again before inserting
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing?.id) {
        alert('You have already registered for this session.');
        setIsRegistered(true);
        setRegistrationId(existing.id);
        return;
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          session_id: sessionId,
          payment_status: 'pending',
        })
        .select();

      if (error || !data || !data[0]?.id) {
        alert('Registration failed: ' + error?.message);
        return;
      }

      const regId = data[0].id;
      alert('Registered successfully! Downloading ticket...');
      setIsRegistered(true);
      setRegistrationId(regId);
      await generatePdfTicket(regId);

    } catch (err) {
      console.error('[RegisterButton] Unexpected error:', err);
      alert('Registration failed due to an unexpected error.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDownloadPass = async () => {
    if (!registrationId) return;
    await generatePdfTicket(registrationId);
  };

  return (
    <button
      className={`px-4 py-2 rounded text-white ${isRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400`}
      onClick={isRegistered ? handleDownloadPass : handleRegister}
      disabled={isRegistering}
    >
      {isRegistering
        ? 'Processing...'
        : isRegistered
        ? 'Download Pass'
        : 'Register'}
    </button>
  );
}
