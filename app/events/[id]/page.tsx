'use client';

import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import RegisterButton from '@/components/RegisterButton';
import { EventSessionCard } from '@/components/EventSessionCard';

// Session type
type Session = {
  id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  cost: number | null;
  currency: string | null;
  upi_link: string | null;
  image_url: string | null;
};

// Event type with sessions
type EventWithSessions = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
  sessions: Session[];
};

// eslint-disable-next-line @next/next/no-async-client-component
export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data, error } = await supabase
    .from('events')
    .select('*, sessions(*)')
    .eq('id', id)
    .single();

  const event = data as EventWithSessions | null;

  if (error || !event) {
    console.error('Error fetching event:', error);
    return <p className="p-4 text-red-600">Event not found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        {event.photo_url && (
          <div className="relative w-full h-64 rounded overflow-hidden">
            <Image
              src={event.photo_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mt-4">{event.name}</h1>
        {event.description && (
          <p className="text-gray-700 mt-2">{event.description}</p>
        )}
        <p className="text-gray-500 mt-1">
          Date: {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {event.sessions.length > 0 ? (
          event.sessions.map((s: Session) => (
            <EventSessionCard
              key={s.id}
              id={s.id}
              title={s.name}
              description={s.description || 'No description'}
              imageUrl={s.image_url || '/images/placeholder.png'}
              eventId={event.id}
              sessionId={s.id}
              isRegistered={false} // RegisterButton inside card handles actual state
              cost={0}
              paymentStatus={''}
            >
              {/* Use RegisterButton as action */}
              <RegisterButton eventId={event.id} sessionId={s.id} />
            </EventSessionCard>
          ))
        ) : (
          <p>No sessions available.</p>
        )}
      </div>
    </div>
  );
}
