'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useSearchParams } from 'next/navigation';
import { EventSessionCard } from '@/components/EventSessionCard';
import RegisterButton from '@/components/RegisterButton';

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
  event_image?: string; // optional image URL
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('event_registration_id');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      const fetchedRegistrations: Registration[] = [];

      // --- Fetch by registrationId (public) ---
      if (registrationId) {
        const { data: regData } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('id', registrationId)
          .maybeSingle();

        if (regData) {
          const { data: eventData } = await supabase
            .from('events')
            .select('name,image_url') // fetch image
            .eq('id', regData.event_id)
            .maybeSingle();

          let sessionName: string | null = null;
          if (regData.session_id) {
            const { data: sessionData } = await supabase
              .from('sessions')
              .select('name')
              .eq('id', regData.session_id)
              .maybeSingle();
            sessionName = sessionData?.name || null;
          }

          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name,number')
            .eq('id', regData.user_id)
            .maybeSingle();

          fetchedRegistrations.push({
            id: regData.id,
            event_id: regData.event_id,
            session_id: regData.session_id,
            event_name: eventData?.name || 'Unknown Event',
            session_name: sessionName,
            payment_status: regData.payment_status,
            user_name: userProfile?.full_name || 'Unknown',
            user_number: userProfile?.number || 'Unknown',
            event_image: eventData?.image_url || '/images/placeholder.png',
          });
        }
      }

      // --- Fetch all registrations of logged-in user ---
      if (user) {
        const { data: userRegs } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('user_id', user.id);

        if (userRegs) {
          for (const r of userRegs) {
            if (r.id === registrationId) continue; // skip duplicate

            const { data: eventData } = await supabase
              .from('events')
              .select('name,image_url')
              .eq('id', r.event_id)
              .maybeSingle();

            let sessionName: string | null = null;
            if (r.session_id) {
              const { data: sessionData } = await supabase
                .from('sessions')
                .select('name')
                .eq('id', r.session_id)
                .maybeSingle();
              sessionName = sessionData?.name || null;
            }

            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('full_name,number')
              .eq('id', r.user_id)
              .maybeSingle();

            fetchedRegistrations.push({
              id: r.id,
              event_id: r.event_id,
              session_id: r.session_id,
              event_name: eventData?.name || 'Unknown Event',
              session_name: sessionName,
              payment_status: r.payment_status,
              user_name: userProfile?.full_name || 'Unknown',
              user_number: userProfile?.number || 'Unknown',
              event_image: eventData?.image_url || '/images/placeholder.png',
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
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {registrations.map((r) => (
          <EventSessionCard
            key={r.id}
            id={r.id}
            title={r.event_name}
            description={`Registered to: ${r.user_name}`}
            imageUrl={r.event_image || '/images/placeholder.png'}
            eventId={r.event_id}
            sessionId={r.session_id || ''}
            isRegistered={true} // always true since these are registrations
            paymentStatus={r.payment_status || 'Pending'} cost={0}          >
              <RegisterButton eventId={r.event_id} sessionId={r.session_id || ''}/>
            </EventSessionCard>
        ))}
      </div>
    </div>
  );
}
