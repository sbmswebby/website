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
  const [isAdmin, setIsAdmin] = useState(false); // 👈 track admin role
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Check if the user is already registered OR is admin
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user: SupabaseSession['user'] | null = sessionData.session?.user || null;
        if (!user) return;

        // check registration
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

        // check role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('[RegisterButton] Error checking user status:', err);
      }
    };

    checkUserStatus();
  }, [sessionId]);

// Cache logo at module level
let cachedLogoBase64: string | null = null;

const loadLogo = async () => {
  if (cachedLogoBase64) return cachedLogoBase64;

  const response = await fetch('/images/sbms_logo.png');
  const blob = await response.blob();
  const reader = new FileReader();
  cachedLogoBase64 = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
  return cachedLogoBase64;
};

const generatePdfTicket = async (regId: string) => {
  try {
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', regId)
      .maybeSingle();
    if (!registration) throw new Error('Registration not found');

    // Event
    const { data: eventData } = await supabase
      .from('events')
      .select('name')
      .eq('id', registration.event_id)
      .maybeSingle();

    // Session
    let sessionName: string | null = null;
    if (registration.session_id) {
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('name')
        .eq('id', registration.session_id)
        .maybeSingle();
      sessionName = sessionData?.name || null;
    }

    // User profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, number')
      .eq('id', registration.user_id)
      .maybeSingle();

    // --- Generate PDF ---
    const pdf = new jsPDF();

    // Border
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 190, 120);

    // Logo (use cached one)
    const logoBase64 = await loadLogo();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const logoSize = 30;
    const logoX = (pageWidth - logoSize) / 2;
    pdf.addImage(logoBase64, 'PNG', logoX, 15, logoSize, logoSize);

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('Event Ticket', pageWidth / 2, 55, { align: 'center' });

    // Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const startY = 70;
    const lineHeight = 8;
    pdf.text(`Name: ${userProfile?.full_name || 'Unknown'}`, 20, startY);
    pdf.text(`Number: ${userProfile?.number || 'Unknown'}`, 20, startY + lineHeight);
    pdf.text(`Event: ${eventData?.name || 'Unknown Event'}`, 20, startY + lineHeight * 2);
    if (sessionName) pdf.text(`Session: ${sessionName}`, 20, startY + lineHeight * 3);
    pdf.text(`Registration ID: ${registration.id}`, 20, startY + lineHeight * 4);
    pdf.text(`Payment Status: ${registration.payment_status || 'Pending'}`, 20, startY + lineHeight * 5);

    // QR Code
    const qrUrl = `https://sbms.com/registrations?event_registration_id=${registration.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);
    pdf.addImage(qrDataUrl, 'PNG', 150, startY, 40, 40);

    // ✅ Save directly
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
    if (!registrationId) {
      alert('No registration found for this session.');
      return;
    }
    await generatePdfTicket(registrationId);
  };

  return (
    <button
      className={` register-btn px-4 py-2 rounded text-white ${
        isRegistered || isAdmin
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } disabled:bg-gray-400`}
      onClick={isRegistered || isAdmin ? handleDownloadPass : handleRegister}
      disabled={isRegistering}
    >
      {isRegistering
        ? 'Processing...'
        : isRegistered || isAdmin
        ? 'Download Pass'
        : 'Register'}
    </button>
  );
}
