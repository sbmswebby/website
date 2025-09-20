'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams, useRouter } from 'next/navigation';
import { EventSessionCard } from '@/components/EventSessionCard';
import RegisterButton from '@/components/RegisterButton';

// --- Types ---
type AllEventRegistrationRow = {
  id: string;
  user_name: string;
  whatsapp_number: string | null;
  beautyparlor_name: string | null;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  created_at: string;
  registration_number: number;
};

type Registration = {
  id: string;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  user_name: string;
  user_number: string;
  event_image: string;
  created_at: string;
  reference: string | null;
};

export default function EventRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get('registration_id');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // --- Get current user session ---
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // --- Case 1: Guest with no registrationId → redirect ---
      if (!user && !registrationId) {
        router.push('/events');
        return;
      }

      // --- Fetch single registration if registrationId is present ---
      if (registrationId) {
        const { data, error } = await supabase
          .from('all_event_registrations')
          .select('*')
          .eq('id', registrationId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const single: Registration = {
            id: String(data.id),
            event_name: data.event_name,
            session_name: data.session_name,
            payment_status: data.payment_status ?? 'pending',
            user_name: data.user_name,
            user_number: data.whatsapp_number ?? 'Unknown',
            event_image: '/images/placeholder.png',
            created_at: data.created_at,
            reference: data.registration_number?.toString() ?? null,
          };
          setRegistrations([single]);
        } else {
          setRegistrations([]);
        }
        return;
      }

      // --- Case 2: Authenticated user → check role ---
      if (!user) {
        setRegistrations([]); // Should not happen, safe guard
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, number')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.role) {
        setRegistrations([]);
        return;
      }

      let data, error;

      if (profile.role === 'admin') {
        // Admin → fetch all registrations
        ({ data, error } = await supabase
          .from('all_event_registrations')
          .select('*')
          .order('created_at', { ascending: false }));
      } else {
        // Non-admin → fetch only their own registrations
        ({ data, error } = await supabase
          .from('all_event_registrations')
          .select('*')
          .eq('whatsapp_number', profile.number)
          .order('created_at', { ascending: false }));
      }

      if (error) throw error;

      if (data) {
        const mapped: Registration[] = data.map((r: AllEventRegistrationRow) => ({
          id: String(r.id),
          event_name: r.event_name,
          session_name: r.session_name,
          payment_status: r.payment_status ?? 'pending',
          user_name: r.user_name,
          user_number: r.whatsapp_number ?? 'Unknown',
          event_image: '/images/placeholder.png',
          created_at: r.created_at,
          reference: r.registration_number?.toString() ?? null,
        }));

        setRegistrations(mapped);
      }
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

  const highlighted = registrations[0]?.id === registrationId ? registrations[0] : null;
  const others = highlighted ? registrations.slice(1) : registrations;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Registrations</h1>

        {highlighted && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Highlighted Registration</h2>
            <EventSessionCard
              id={highlighted.id}
              title={highlighted.event_name}
              description={`👤 Name: ${highlighted.user_name},  Phone: ${highlighted.user_number} ,
🕒 Registered: ${formatDate(highlighted.created_at)}, 
${highlighted.session_name ? `🎟️ Session: ${highlighted.session_name} ,` : ''}
${highlighted.reference ? `Ref: ${highlighted.reference}` : ''}`}
              imageUrl={highlighted.event_image}
              eventId={''}
              sessionId={highlighted.session_name ?? ''}
              isRegistered={true}
              paymentStatus={''}
              cost={0}
            />
          </div>
        )}

        {others.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">All Registrations</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {others.map((r) => (
                <EventSessionCard
                  key={r.id}
                  id={r.id}
                  title={r.event_name}
                  description={`👤 ${r.user_name},   (${r.user_number})
🕒 Registered: ${formatDate(r.created_at)}
${r.session_name ? `🎟️ Session: ${r.session_name}, ` : ''}
${r.reference ? `Ref: ${r.reference}, ` : ''}`}
                  imageUrl={r.event_image}
                  eventId={''}
                  sessionId={r.session_name ?? ''}
                  isRegistered={true}
                  paymentStatus={''}
                  cost={0}
                >
                </EventSessionCard>
              ))}
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
