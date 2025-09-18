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

interface FormData {
  user_name: string;
  whatsapp_number: string;
  beautyparlor_name: string;
}

interface UserProfile {
  full_name: string;
  number: string;
  organisation: string | null;
  role?: string;
}

interface EventRegistration {
  id: string;
}

interface AllEventRegistration {
  id: string;
  user_name: string;
  whatsapp_number: string;
  beautyparlor_name: string | null;
  event_name: string;
  session_name: string | null;
  registration_number: number;
}

interface SessionData {
  name: string;
}

interface EventData {
  name: string;
}

interface TicketData {
  name: string;
  whatsapp: string;
  beautyParlor: string;
  eventName: string;
  sessionName?: string;
  registrationNumber: string | number;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  // --- Local state management ---
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    user_name: '',
    whatsapp_number: '',
    beautyparlor_name: ''
  });

  const router = useRouter();

  // --- Fetch event name from DB when component mounts ---
  useEffect(() => {
    const fetchEventName = async (): Promise<void> => {
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
    const checkUserStatus = async (): Promise<void> => {
      try {
        // Get active user session
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user || null;

        if (user) {
          // Check if user has already registered for this specific session
          const { data: existing } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('session_id', sessionId)
            .maybeSingle();

          console.log(`[RegisterButton] Checking registration for session ${sessionId}:`, existing);

          if (existing?.id) {
            setIsRegistered(true);
            setRegistrationId(existing.id);
          } else {
            // IMPORTANT: Reset state if not registered for this specific session
            setIsRegistered(false);
            setRegistrationId(null);
          }

          // Check if user is admin (only set once)
          if (!isAdmin) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();

            if (profile?.role === 'admin') setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('[RegisterButton] Error checking user status:', err);
      }
    };

    checkUserStatus();
  }, [sessionId, isAdmin]); // Added isAdmin to dependencies

  // --- Cache and load event logo for ticket PDF ---
  let cachedLogoBase64: string | null = null;
  
  const loadLogo = async (): Promise<string> => {
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
  const generatePdfTicket = async (data: TicketData): Promise<void> => {
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
  const handleRegister = async (): Promise<void> => {
    console.log(">>> [handleRegister] called");
    setIsRegistering(true);

    try {
      // --- Get current session ---
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log(">>> [handleRegister] sessionData:", sessionData, "error:", sessionError);

      const user = sessionData.session?.user;
      console.log(">>> [handleRegister] current user:", user);

      if (!user) {
        console.warn(">>> [handleRegister] No logged in user, opening manual modal");
        setShowModal(true);
        return;
      }

      // --- Check if already registered ---
      const { data: existing, error: existingError } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .maybeSingle();
      console.log(">>> [handleRegister] existing registration:", existing, "error:", existingError);

      if (existing?.id) {
        alert("Already registered for this session.");
        setIsRegistered(true);
        setRegistrationId(existing.id);
        return;
      }

      // --- Insert into event_registrations ---
      const { data: eventReg, error: eventError } = await supabase
        .from("event_registrations")
        .insert({
          user_id: user.id,
          event_id: eventId,
          session_id: sessionId,
          payment_status: "pending",
        })
        .select("id")
        .returns<EventRegistration[]>();

      console.log(">>> [handleRegister] inserted into event_registrations:", eventReg, "error:", eventError);

      if (!eventReg || eventError) {
        alert("Registration failed: " + (eventError?.message || "Unknown error"));
        return;
      }

      const regId = eventReg[0].id;
      setIsRegistered(true);
      setRegistrationId(regId);
      console.log(">>> [handleRegister] new registrationId:", regId);

      // --- Fetch user profile ---
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("full_name, number, organisation")
        .eq("id", user.id)
        .maybeSingle()
        .returns<UserProfile | null>();

      console.log(">>> [handleRegister] user profile:", profile, "error:", profileError);

      if (!profile) {
        alert("Profile not found for user.");
        return;
      }

      // --- Fetch session details ---
      const { data: sessionRow, error: sessionRowError } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", sessionId)
        .maybeSingle()
        .returns<SessionData | null>();

      console.log(">>> [handleRegister] session row:", sessionRow, "error:", sessionRowError);

      const sessionName = sessionRow?.name || "Unknown";

      // --- Insert into all_event_registrations ---
      const { data: allReg, error: allError } = await supabase
        .from("all_event_registrations")
        .insert({
          user_name: profile.full_name,
          whatsapp_number: profile.number,
          beautyparlor_name: profile.organisation || null,
          event_name: eventName,
          session_name: sessionName,
          payment_status: "pending",
        })
        .select("id, user_name, whatsapp_number, beautyparlor_name, event_name, session_name, registration_number")
        .returns<AllEventRegistration[]>();

      console.log(">>> [handleRegister] inserted into all_event_registrations:", allReg, "error:", allError);

      if (!allReg || allError) {
        alert("Failed adding to all_event_registrations: " + (allError?.message || "Unknown error"));
        return;
      }

      const allRegRow = allReg[0];
      console.log(">>> [handleRegister] all_event_registrations row:", allRegRow);

      alert("Registered! Downloading ticket...");

      // --- Generate ticket PDF ---
      await generatePdfTicket({
        name: allRegRow.user_name,
        whatsapp: allRegRow.whatsapp_number,
        beautyParlor: allRegRow.beautyparlor_name || "Unknown",
        eventName: allRegRow.event_name,
        sessionName: allRegRow.session_name || undefined,
        registrationNumber: allRegRow.registration_number,
      });
      console.log(">>> [handleRegister] PDF generation completed");
    } catch (err) {
      console.error("[handleRegister] Registration failed:", err);
      alert("Registration failed. Check console.");
    } finally {
      setIsRegistering(false);
    }
  };

  // --- Handle manual registration (guest users) ---
  const handleManualSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    console.log("handleManualSubmit for not logged in user was called");

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
        .select()
        .returns<AllEventRegistration[]>();

      if (!data || error) {
        alert('Manual registration failed: ' + (error?.message || "Unknown error"));
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

  const handleDownloadPass = async (): Promise<void> => {
    if (!registrationId) {
      alert('No registration found.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      alert("No logged-in user found.");
      return;
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("full_name, number, organisation")
      .eq("id", user.id)
      .maybeSingle()
      .returns<UserProfile | null>();

    console.log(">>> [Download Pass] profile data:", profile, "error:", profileError);

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      alert("Failed to fetch user profile.");
      return;
    }

    // Fetch session name
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("name")
      .eq("id", sessionId)
      .maybeSingle()
      .returns<SessionData | null>();

    // FIXED: Fetch the registration_number from all_event_registrations
    const { data: allEventReg, error: allEventError } = await supabase
      .from("all_event_registrations")
      .select("registration_number")
      .eq("user_name", profile?.full_name || "")
      .eq("event_name", eventName)
      .eq("session_name", sessionRow?.name || "")
      .maybeSingle();

    console.log(">>> [Download Pass] all_event_registrations data:", allEventReg, "error:", allEventError);

    const registrationNumber = allEventReg?.registration_number || registrationId;

    await generatePdfTicket({
      name: profile?.full_name || "Unknown",
      whatsapp: profile?.number || "Unknown",
      beautyParlor: profile?.organisation || "Unknown",
      eventName: eventName || "Event",
      sessionName: sessionRow?.name || "Unknown",
      registrationNumber: registrationNumber,
    });
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
        onClick={async () => {
          if (isRegistered || isAdmin) {
            await handleDownloadPass();
          } else {
            await handleRegister();
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