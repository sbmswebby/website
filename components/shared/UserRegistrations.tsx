'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { EventSessionCard } from '@/components/shared/EventSessionCard';

// --------------------
// Types
// --------------------
interface Registration {
  id: string;
  eventName: string;
  sessionName: string | null;
  name: string;
  whatsapp: string;
  profession?: string | null;
  organisation?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  serialNo: number;
}

// --------------------
// Component
// --------------------
function EventRegistrationsContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  // Fetch registrations from Supabase
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      // --- Single registration by ID ---
      if (registrationId) {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('*, events(name), sessions(title, image_url)')
          .eq('id', registrationId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const single: Registration = {
            id: data.id,
            eventName: data.events?.name || 'Unknown Event',
            sessionName: data.sessions?.title || null,
            name: data.name,
            whatsapp: data.whatsapp,
            profession: data.profession,
            organisation: data.organisation,
            photoUrl: data.sessions?.image_url ?? '/placeholder.png',
            createdAt: data.created_at,
            serialNo: data.serial_no,
          };
          setRegistrations([single]);
        } else {
          setRegistrations([]);
        }
        return;
      }

      // --- Fetch all registrations ---
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, events(name), sessions(title, image_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Registration[] = data.map((r) => ({
          id: r.id,
          eventName: r.events?.name || 'Unknown Event',
          sessionName: r.sessions?.title || null,
          name: r.name,
          whatsapp: r.whatsapp,
          profession: r.profession,
          organisation: r.organisation,
          photoUrl: r.sessions?.image_url ?? '/placeholder.png',
          createdAt: r.created_at,
          serialNo: r.serial_no,
        }));
        setRegistrations(mapped);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  // Fetch registrations on mount or when registrationId changes
  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  if (loading) return <p>Loading registrations...</p>;
  if (!registrations.length) return <p>No registrations found.</p>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  // Highlight a registration if `registrationId` is present
  const highlighted = registrations[0]?.id === registrationId ? registrations[0] : null;
  const others = highlighted ? registrations.slice(1) : registrations;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrations</h1>

      {highlighted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Highlighted Registration</h2>
          <EventSessionCard
            id={highlighted.id}
            title={highlighted.eventName}
            description={`👤 ${highlighted.name}, ${highlighted.whatsapp}
🕒 Registered: ${formatDate(highlighted.createdAt)}
${highlighted.sessionName ? `🎟️ Session: ${highlighted.sessionName}` : ''}
Ref: ${highlighted.serialNo}`}
            imageUrl={highlighted.photoUrl ?? '/placeholder.png'}
            eventId={highlighted.eventName}
            sessionId={highlighted.sessionName ?? ''}
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
                title={r.eventName}
                description={`👤 ${r.name} (${r.whatsapp})
🕒 Registered: ${formatDate(r.createdAt)}
${r.sessionName ? `🎟️ Session: ${r.sessionName}` : ''}
Ref: ${r.serialNo}`}
                imageUrl={r.photoUrl ?? '/placeholder.png'}
                eventId={r.eventName}
                sessionId={r.sessionName ?? ''}
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

// --------------------
// Wrapper Component
// --------------------
export default function EventRegistrations() {
  return (
    <Suspense fallback={<p>Loading registrations...</p>}>
      <EventRegistrationsContent />
    </Suspense>
  );
}
