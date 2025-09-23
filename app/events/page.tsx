'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams, useRouter } from 'next/navigation';
import { EventSessionCard } from '@/components/EventSessionCard';

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
  session_id?: string;
  sessions?: { id: string; image_url: string | null };
};

type Registration = {
  id: string;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  user_name: string;
  user_number: string;
  image_url: string;
  created_at: string;
  reference: string | null;
};

function EventRegistrationsContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get('registration_id');

  const fetchRegistrations = useCallback(async () => {
    console.log('🔄 fetchRegistrations() called');
    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) console.error('❌ Error fetching session:', sessionError);

      const user = sessionData.session?.user;

      if (!user && !registrationId) {
        console.warn('⚠️ No user and no registrationId → redirecting to /events');
        router.push('/events');
        return;
      }

      // --- Fetch single registration ---
      if (registrationId) {
        const { data, error } = await supabase
          .from('all_event_registrations')
          .select('*, sessions(id, image_url)')
          .eq('id', registrationId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const single: Registration = {
            id: data.id,
            event_name: data.event_name,
            session_name: data.session_name,
            payment_status: data.payment_status ?? 'pending',
            user_name: data.user_name,
            user_number: data.whatsapp_number ?? 'Unknown',
            image_url: data.sessions?.image_url ?? '/placeholder.png',
            created_at: data.created_at,
            reference: data.registration_number?.toString() ?? null,
          };
          setRegistrations([single]);
        } else {
          setRegistrations([]);
        }
        return;
      }

      if (!user) {
        setRegistrations([]);
        return;
      }

      // --- Fetch profile ---
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, number')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) console.error('❌ Error fetching profile:', profileError);
      if (!profile?.role) {
        setRegistrations([]);
        return;
      }

      // --- Fetch all registrations ---
      let query = supabase
        .from('all_event_registrations')
        .select('*, sessions(id, image_url)')
        .order('created_at', { ascending: false });

      if (profile.role !== 'admin') {
        query = query.eq('whatsapp_number', profile.number);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Registration[] = data.map((r: AllEventRegistrationRow) => ({
          id: r.id,
          event_name: r.event_name,
          session_name: r.session_name,
          payment_status: r.payment_status ?? 'pending',
          user_name: r.user_name,
          user_number: r.whatsapp_number ?? 'Unknown',
          image_url: r.sessions?.image_url ?? '/placeholder.png',
          created_at: r.created_at,
          reference: r.registration_number?.toString() ?? null,
        }));
        setRegistrations(mapped);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('💥 Unexpected error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [registrationId, router]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  if (loading) return <p className="p-4">Loading registrations...</p>;
  if (registrations.length === 0) return <p className="p-4">No registrations found.</p>;

  const highlighted = registrations[0]?.id === registrationId ? registrations[0] : null;
  const others = highlighted ? registrations.slice(1) : registrations;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrations</h1>

      {highlighted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Highlighted Registration</h2>
          <EventSessionCard
            id={highlighted.id}
            title={highlighted.event_name}
            description={`👤 Name: ${highlighted.user_name},  Phone: ${highlighted.user_number}
🕒 Registered: ${formatDate(highlighted.created_at)}
${highlighted.session_name ? `🎟️ Session: ${highlighted.session_name}, ` : ''} 
${highlighted.reference ? `Ref: ${highlighted.reference}` : ''}`}
            imageUrl={highlighted.image_url}
            eventId=""
            sessionId={highlighted.session_name ?? ''}
            isRegistered={true}
            paymentStatus=""
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
                imageUrl={r.image_url}
                eventId=""
                sessionId={r.session_name ?? ''}
                isRegistered={true}
                paymentStatus=""
                cost={0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ✅ Wrap only where useSearchParams is used
export default function EventRegistrations() {
  return (
    <Suspense fallback={<div>Loading search params...</div>}>
      <EventRegistrationsContent />
    </Suspense>
  );
}
