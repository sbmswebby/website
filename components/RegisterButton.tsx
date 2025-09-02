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
  try {
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', regId)
      .maybeSingle();
    if (!registration) throw new Error('Registration not found');

    // Fetch event
    const { data: eventData } = await supabase
      .from('events')
      .select('name')
      .eq('id', registration.event_id)
      .maybeSingle();

    // Fetch session name
    let sessionName: string | null = null;
    if (registration.session_id) {
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('name')
        .eq('id', registration.session_id)
        .maybeSingle();
      sessionName = sessionData?.name || null;
    }

    // Fetch user profile (name + number)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name,number')
      .eq('id', registration.user_id)
      .maybeSingle();

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Event Ticket', 20, 30);
    pdf.setFontSize(14);
    pdf.text(`Name: ${userProfile?.full_name || 'Unknown'}`, 20, 45);
    pdf.text(`Number: ${userProfile?.number || 'Unknown'}`, 20, 55);
    pdf.text(`Event: ${eventData?.name || eventName || 'Unknown Event'}`, 20, 70);
    if (sessionName) pdf.text(`Session: ${sessionName}`, 20, 80);
    pdf.text(`Registration ID: ${registration.id}`, 20, 90);
    pdf.text(`Payment Status: ${registration.payment_status || 'Pending'}`, 20, 100);

    const qrUrl = `https://sbms.com/registrations?event_registration_id=${registration.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);
    pdf.addImage(qrDataUrl, 'PNG', 20, 110, 50, 50);

    pdf.save(`Ticket-${registration.id}.pdf`);
  } catch (err) {
    console.error('[RegisterButton] PDF generation failed:', err);
    alert('Failed to generate ticket.');
  }
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
      className={` register-btn px-4 py-2 rounded text-white ${isRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400`}
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
