'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  // --- Local state management ---
  const [isRegistering, setIsRegistering] = useState(false); // tracks if registration is in progress
  const [isRegistered, setIsRegistered] = useState(false);   // tracks if user already registered
  const [isAdmin, setIsAdmin] = useState(false);             // tracks if user is admin
  const [registrationId, setRegistrationId] = useState<string | null>(null); // holds registration id
  const [eventName, setEventName] = useState<string>('');    // holds current event name

  const [showModal, setShowModal] = useState(false); // toggles manual registration modal
  const [formData, setFormData] = useState({
    user_name: '',
    whatsapp_number: '',
    beautyparlor_name: ''
  });

  const router = useRouter();

  // --- Fetch event name from DB when component mounts ---
  useEffect(() => {
    const fetchEventName = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('name')
          .eq('id', eventId)
          .maybeSingle();

        if (error) throw error;
        if (data?.name) {
          setEventName(data.name);
          console.log('[RegisterButton] Event name loaded:', data.name);
        }
      } catch (err) {
        console.error('[RegisterButton] Failed to fetch event name:', err);
      }
    };

    fetchEventName();
  }, [eventId]);

  // --- Check if user is already registered / is admin ---
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Get active user session
        const { data: sessionData } = await supabase.auth.getSession();
        const user: SupabaseSession['user'] | null = sessionData.session?.user || null;

        if (user) {
          // Check if user has already registered for this session
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

          // Check if user is admin
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin') setIsAdmin(true);
        }
      } catch (err) {
        console.error('[RegisterButton] Error checking user status:', err);
      }
    };

    checkUserStatus();
  }, [sessionId]);

  // --- Cache and load event logo for ticket PDF ---
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

  // --- Generate ticket PDF with QR code ---
  const generatePdfTicket = async (data: {
    name: string;
    whatsapp: string;
    beautyParlor: string;
    eventName: string;
    sessionName?: string;
    registrationNumber: string | number;
  }) => {
    try {
      const pdf = new jsPDF();

      // Draw border
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, 190, 130);

      // Add event logo
      const logoBase64 = await loadLogo();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const logoSize = 30;
      pdf.addImage(logoBase64, 'PNG', (pageWidth - logoSize) / 2, 15, logoSize, logoSize);

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Event Ticket', pageWidth / 2, 55, { align: 'center' });

      // Ticket details
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const startY = 70;
      const lineHeight = 8;
      pdf.text(`Name: ${data.name}`, 20, startY);
      pdf.text(`Number: ${data.whatsapp}`, 20, startY + lineHeight);
      pdf.text(`Beauty Parlor: ${data.beautyParlor}`, 20, startY + lineHeight * 2);
      pdf.text(`Event: ${data.eventName}`, 20, startY + lineHeight * 3);
      if (data.sessionName) pdf.text(`Session: ${data.sessionName}`, 20, startY + lineHeight * 4);
      pdf.text(`Registration #: ${data.registrationNumber}`, 20, startY + lineHeight * 5);

      // QR Code linking to registration page
      const qrUrl = `https://sbmsacademy.in/registrations?reg_number=${data.registrationNumber}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      pdf.addImage(qrDataUrl, 'PNG', 150, startY, 40, 40);

      // Save file
      pdf.save(`Ticket-${data.registrationNumber}.pdf`);
    } catch (err) {
      console.error('[RegisterButton] PDF generation failed:', err);
      alert('Failed to generate ticket.');
    }
  };

  // --- Handle automatic registration for logged-in users ---
  const handleRegister = async () => {
    console.log("handleregister for logged in user was called")
    setIsRegistering(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // If user is not logged in, open manual registration modal
      if (!user) {
        setShowModal(true);
        return;
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing?.id) {
        alert('Already registered.');
        setIsRegistered(true);
        setRegistrationId(existing.id);
        return;
      }

      // Insert new registration into event_registrations table
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          session_id: sessionId,
          payment_status: 'pending',
        })
        .select();

      if (!data || error) {
        alert('Registration failed: ' + error?.message);
        return;
      }

      const regId = data[0].id;
      setIsRegistered(true);
      setRegistrationId(regId);
      alert('Registered! Downloading ticket...');
      
      // Fetch user profile details to include in ticket
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, number')
        .eq('id', user.id)
        .maybeSingle();
      console.log("profile: ",profile)
      // Generate ticket PDF
      await generatePdfTicket({
        name: profile?.full_name || 'Unknown',
        whatsapp: profile?.number || 'Unknown',
        beautyParlor: profile?.full_name || 'Unknown',
        eventName: eventName || 'Event',
        registrationNumber: regId,
      });
    } catch (err) {
      console.error('[RegisterButton] Registration failed:', err);
      alert('Registration failed. Check console.');
    } finally {
      setIsRegistering(false);
    }
  };

  // --- Handle manual registration (guest users) ---
  const handleManualSubmit = async (e: FormEvent) => {
        console.log("handleManualSubmit for not logged in user was called")

    e.preventDefault();

    // Validate required field
    if (!formData.beautyparlor_name) {
      alert('Beauty Parlor / Salon Name is required.');
      return;
    }

    setIsRegistering(true);
    try {
      // Insert guest registration into all_event_registrations
      const { data, error } = await supabase
        .from('all_event_registrations')
        .insert({
          user_name: formData.user_name,
          whatsapp_number: formData.whatsapp_number,
          beautyparlor_name: formData.beautyparlor_name,
          event_name: eventName || 'Event',
        })
        .select();

      if (!data || error) {
        alert('Manual registration failed: ' + error?.message);
        return;
      }

      const regNumber = data[0].registration_number;

      // Generate ticket for guest user
      await generatePdfTicket({
        name: formData.user_name,
        whatsapp: formData.whatsapp_number,
        beautyParlor: formData.beautyparlor_name,
        eventName: data[0].event_name,
        registrationNumber: regNumber,
      });

      alert('Registration successful!');
      setShowModal(false);
      setFormData({ user_name: '', whatsapp_number: '', beautyparlor_name: '' });
    } catch (err) {
      console.error('[RegisterButton] Manual registration failed:', err);
      alert('Registration failed. Check console.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div>
      {/* Main button: Handles registration OR downloads ticket if already registered/admin */}
      <button
        className={`register-btn px-4 py-2 rounded text-white ${
          isRegistered || isAdmin
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } disabled:bg-gray-400`}
        onClick={() => {
          if (isRegistered || isAdmin) {
            if (!registrationId) return alert('No registration found.');

            // Download pass if already registered/admin
            generatePdfTicket({
              name: 'Registered User',
              whatsapp: 'Unknown',
              beautyParlor: 'Unknown',
              eventName: eventName || 'Event',
              registrationNumber: registrationId,
            });
          } else {
            // Trigger normal registration flow
            handleRegister();
          }
        }}
        disabled={isRegistering}
      >
        {isRegistering ? 'Processing...' : isRegistered || isAdmin ? 'Download Pass' : 'Register'}
      </button>

      {/* Modal for manual registration */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            {/* Close modal */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 className="mb-4 text-lg font-bold">Register Manually</h3>

            {/* Manual registration form */}
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="mb-2 w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                required
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="mb-2 w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Beauty Parlor / Salon Name"
                required
                value={formData.beautyparlor_name}
                onChange={(e) => setFormData({ ...formData, beautyparlor_name: e.target.value })}
                className="mb-2 w-full p-2 border rounded"
              />
              <button
                type="submit"
                disabled={isRegistering}
                className="px-4 py-2 bg-blue-600 text-white rounded mt-2 w-full"
              >
                {isRegistering ? 'Processing...' : 'Submit & Download Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
