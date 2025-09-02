'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import RegisterButton from '@/components/RegisterButton';
import { EventSessionCard } from '@/components/EventSessionCard';

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

type EventWithSessions = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
  sessions: Session[];
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ unwrap promise
  const { id } = use(params);

  const [event, setEvent] = useState<EventWithSessions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, sessions(*)')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('Error fetching event:', error);
          setEvent(null);
        } else {
          setEvent(data as EventWithSessions);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="p-4">Loading event...</p>;
  if (!event) return <p className="p-4 text-red-600">Event not found.</p>;

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
        {event.description && <p className="text-gray-700 mt-2">{event.description}</p>}
        <p className="text-gray-500 mt-1">
          Date: {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {event.sessions.length > 0 ? (
          event.sessions.map((s) => (
            <EventSessionCard
              key={s.id}
              id={s.id}
              title={s.name}
              description={s.description || 'No description'}
              imageUrl={s.image_url || '/images/placeholder.png'}
              eventId={event.id}
              sessionId={s.id}
              isRegistered={false}
              cost={s.cost || 0}
              paymentStatus=""
            >
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
