'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { EventSessionCard } from '@/components/EventSessionCard';
import RegisterButton from '@/components/RegisterButton';

// --- Types ---
type EventRegistrationRow = {
  id: string;
  event_id: string;
  session_id: string | null;
  user_id: string;
  payment_status: string | null;
  created_at: string;
  reference: string | null;
};

type EventRow = {
  id: string;
  name: string;
  photo_url: string | null;
};

type SessionRow = {
  id: string;
  name: string;
};

type UserProfileRow = {
  id: string;
  full_name: string | null;
  number: string | null;
};

type Registration = {
  id: string;
  event_id: string;
  session_id: string | null;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  user_name: string;
  user_number: string;
  event_image: string;
  created_at: string;
  reference: string | null;
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
      const user = sessionData?.session?.user ?? null;
      const fetched: Registration[] = [];

      // --- Fetch single by param ---
      let highlighted: Registration | null = null;
      if (registrationId) {
        const { data: regData } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('id', registrationId)
          .maybeSingle<EventRegistrationRow>();

        if (regData) {
          const { data: eventData } = await supabase
            .from('events')
            .select('id,name,photo_url')
            .eq('id', regData.event_id)
            .maybeSingle<EventRow>();

          let sessionName: string | null = null;
          if (regData.session_id) {
            const { data: sData } = await supabase
              .from('sessions')
              .select('id,name')
              .eq('id', regData.session_id)
              .maybeSingle<SessionRow>();
            sessionName = sData?.name ?? null;
          }

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id,full_name,number')
            .eq('id', regData.user_id)
            .maybeSingle<UserProfileRow>();

          highlighted = {
            id: regData.id,
            event_id: regData.event_id,
            session_id: regData.session_id,
            event_name: eventData?.name ?? 'Unknown Event',
            session_name: sessionName,
            payment_status: regData.payment_status,
            user_name: profile?.full_name ?? 'Unknown',
            user_number: profile?.number ?? 'Unknown',
            event_image: eventData?.photo_url ?? '/images/placeholder.png',
            created_at: regData.created_at,
            reference: regData.reference,
          };
        }
      }

      // --- Fetch all user registrations ---
      if (user) {
        const { data: userRegs } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('user_id', user.id);

        if (userRegs) {
          for (const r of userRegs as EventRegistrationRow[]) {
            if (r.id === registrationId) continue; // skip duplicate
            const { data: eventData } = await supabase
              .from('events')
              .select('id,name,photo_url')
              .eq('id', r.event_id)
              .maybeSingle<EventRow>();

            let sessionName: string | null = null;
            if (r.session_id) {
              const { data: sData } = await supabase
                .from('sessions')
                .select('id,name')
                .eq('id', r.session_id)
                .maybeSingle<SessionRow>();
              sessionName = sData?.name ?? null;
            }

            const { data: profile } = await supabase
              .from('user_profiles')
              .select('id,full_name,number')
              .eq('id', r.user_id)
              .maybeSingle<UserProfileRow>();

            fetched.push({
              id: r.id,
              event_id: r.event_id,
              session_id: r.session_id,
              event_name: eventData?.name ?? 'Unknown Event',
              session_name: sessionName,
              payment_status: r.payment_status,
              user_name: profile?.full_name ?? 'Unknown',
              user_number: profile?.number ?? 'Unknown',
              event_image: eventData?.photo_url ?? '/images/placeholder.png',
              created_at: r.created_at,
              reference: r.reference,
            });
          }
        }
      }

      // ✅ First highlighted one, then the rest
      setRegistrations(highlighted ? [highlighted, ...fetched] : fetched);
    } catch (err) {
      console.error('Unexpected error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [registrationId]);



  if (loading) return <p className="p-4">Loading registrations...</p>;
  if (registrations.length === 0) return <p className="p-4">No registrations found.</p>;

  // --- Split highlighted & others ---
  const highlighted = registrations[0]?.id === registrationId ? registrations[0] : null;
  const others = highlighted ? registrations.slice(1) : registrations;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(); // ✅ Just date, no time
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrations</h1>

      {highlighted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Highlighted Registration</h2>
          <EventSessionCard
            id={highlighted.id}
            title={highlighted.event_name}
            description={
              `👤Name: ${highlighted.user_name}, Phone: (${highlighted.user_number}),
🕒 Registered At: ${formatDate(highlighted.created_at)},
${highlighted.session_name ? `🎟️ Session: ${highlighted.session_name}` : ''},
💰 Payment: ${highlighted.payment_status ?? 'Pending'}
${highlighted.reference ? `, Ref: ${highlighted.reference}` : ''}`
            }
            imageUrl={highlighted.event_image}
            eventId={highlighted.event_id}
            sessionId={highlighted.session_id ?? ''}
            isRegistered={true}
            paymentStatus={highlighted.payment_status ?? 'Pending'}
            cost={0}
          >
          </EventSessionCard>
        </div>
      )}

      {others.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Your Other Registrations</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 ">
            {others.map((r) => (
              <EventSessionCard
                key={r.id}
                id={r.id}
                title={r.event_name}
                description={
                  `👤 ${r.user_name} (${r.user_number})
🕒 Registered: ${formatDate(r.created_at)}
${r.session_name ? `🎟️ Session: ${r.session_name}` : ''}
💰 Payment: ${r.payment_status ?? 'Pending'}
${r.reference ? `Ref: ${r.reference}` : ''}`
                }
                imageUrl={r.event_image}
                eventId={r.event_id}
                sessionId={r.session_id ?? ''}
                isRegistered={true}
                paymentStatus={r.payment_status ?? 'Pending'}
                cost={0}
              >
                <RegisterButton eventId={r.event_id} sessionId={r.session_id ?? ''} />
              </EventSessionCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
