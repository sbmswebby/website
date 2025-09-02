'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useSearchParams } from 'next/navigation';

// Registration state type
type Registration = {
  id: string;
  event_id: string;
  session_id: string | null;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  user_name: string;
  user_number: string;
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('event_registration_id');

  const fetchRegistrations = async () => {
    console.log('[RegistrationsPage] fetchRegistrations started');
    setLoading(true);

    try {
      console.log('[RegistrationsPage] Fetching user session');
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      console.log('[RegistrationsPage] Logged-in user:', user);

      const fetchedRegistrations: Registration[] = [];

      // --- Fetch by registrationId (public) ---
      if (registrationId) {
        console.log('[RegistrationsPage] Fetching public registration by ID:', registrationId);
        const { data: regData, error: regError } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('id', registrationId)
          .maybeSingle();

        if (regError) console.error('[RegistrationsPage] Error fetching registration by ID:', regError);
        console.log('[RegistrationsPage] regData:', regData);

        if (regData) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('name')
            .eq('id', regData.event_id)
            .maybeSingle();
          if (eventError) console.error('[RegistrationsPage] Event fetch error:', eventError);

          let sessionName: string | null = null;
          if (regData.session_id) {
            const { data: sessionData, error: sessionError } = await supabase
              .from('sessions')
              .select('name')
              .eq('id', regData.session_id)
              .maybeSingle();
            if (sessionError) console.error('[RegistrationsPage] Session fetch error:', sessionError);
            sessionName = sessionData?.name || null;
          }

          const { data: userProfile, error: userProfileError } = await supabase
            .from('user_profiles')
            .select('full_name,number')
            .eq('id', regData.user_id)
            .maybeSingle();
          if (userProfileError) console.error('[RegistrationsPage] User profile fetch error:', userProfileError);

          fetchedRegistrations.push({
            id: regData.id,
            event_id: regData.event_id,
            session_id: regData.session_id,
            event_name: eventData?.name || 'Unknown Event',
            session_name: sessionName,
            payment_status: regData.payment_status,
            user_name: userProfile?.full_name || 'Unknown',
            user_number: userProfile?.number || 'Unknown',
          });
        }
      }

      // --- Fetch all registrations of logged-in user ---
      if (user) {
        const { data: userRegs, error: userRegsError } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('user_id', user.id);

        if (userRegsError) console.error('[RegistrationsPage] Error fetching user registrations:', userRegsError);

        if (userRegs) {
          for (const r of userRegs) {
            if (r.id === registrationId) continue; // skip duplicate

            const { data: eventData, error: eventError } = await supabase
              .from('events')
              .select('name')
              .eq('id', r.event_id)
              .maybeSingle();
            if (eventError) console.error('[RegistrationsPage] Event fetch error:', eventError);

            let sessionName: string | null = null;
            if (r.session_id) {
              const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('name')
                .eq('id', r.session_id)
                .maybeSingle();
              if (sessionError) console.error('[RegistrationsPage] Session fetch error:', sessionError);
              sessionName = sessionData?.name || null;
            }

            const { data: userProfile, error: userProfileError } = await supabase
              .from('user_profiles')
              .select('full_name,number')
              .eq('id', r.user_id)
              .maybeSingle();
            if (userProfileError) console.error('[RegistrationsPage] User profile fetch error:', userProfileError);

            fetchedRegistrations.push({
              id: r.id,
              event_id: r.event_id,
              session_id: r.session_id,
              event_name: eventData?.name || 'Unknown Event',
              session_name: sessionName,
              payment_status: r.payment_status,
              user_name: userProfile?.full_name || 'Unknown',
              user_number: userProfile?.number || 'Unknown',
            });
          }
        }
      }

      setRegistrations(fetchedRegistrations);
    } catch (err) {
      console.error('[RegistrationsPage] Unexpected error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [registrationId]);

  const generatePdfTicket = async (registration: Registration) => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Event Ticket', 20, 30);
    pdf.setFontSize(14);
    pdf.text(`Name: ${registration.user_name}`, 20, 45);
    pdf.text(`Number: ${registration.user_number}`, 20, 55);
    pdf.text(`Event: ${registration.event_name}`, 20, 70);
    if (registration.session_name) pdf.text(`Session: ${registration.session_name}`, 20, 80);
    pdf.text(`Registration ID: ${registration.id}`, 20, 90);
    pdf.text(`Payment Status: ${registration.payment_status || 'Pending'}`, 20, 100);

    const qrUrl = `https://yourwebsite.com/registration?event_registration_id=${registration.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);
    pdf.addImage(qrDataUrl, 'PNG', 20, 110, 50, 50);

    pdf.save(`Ticket-${registration.id}.pdf`);
  };

  if (loading) return <p className="p-4">Loading registrations...</p>;
  if (registrations.length === 0) return <p className="p-4">No registrations found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrations</h1>
      <div className="space-y-4">
        {registrations.map((r) => (
          <div
            key={r.id}
            className="bg-gray-50 rounded-lg p-4 shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{r.event_name}</h2>
              {r.session_name && <p className="text-gray-600">Session: {r.session_name}</p>}
              <p className="text-gray-500">Payment: {r.payment_status || 'Pending'}</p>
              <p className="text-gray-500">Registered to: {r.user_name}</p>
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => generatePdfTicket(r)}
            >
              Download Pass
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
