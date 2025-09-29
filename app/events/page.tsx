'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { EventSessionCard } from '@/components/shared/EventSessionCard';

/**
 * Matches the schema of `events` table
 */
type Event = {
  id: string;
  name: string;
  description: string | null;
  start_time: string;       // ✅ use start_time from schema
  end_time: string;         // optional if you need it later
  image_url: string | null; // ✅ matches schema
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('events')
        .select('id, name, description, start_time, end_time, image_url')
        .order('start_time', { ascending: true }); // ✅ fixed

      if (error) {
        console.error('[EventsPage] Error fetching events:', error);
        setError('Failed to load events. Please try again.');
      } else {
        setEvents(data as Event[]);
      }

      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading events... if this takes too long reload the page</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const safeImageUrl =
              event.image_url && event.image_url.trim() !== ''
                ? event.image_url
                : '/images/placeholder.png';

            return (
              <div
                key={event.id}
                className="cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <EventSessionCard
                  id={event.id}
                  title={event.name}
                  description={event.description || 'No description'}
                  imageUrl={safeImageUrl}
                  eventId={event.id}
                  sessionId={''} // not needed here
                  cost={0}
                  isRegistered={false}
                  paymentStatus={''}
                />
              </div>
            );
          })
        ) : (
          <p>No upcoming events found.</p>
        )}
      </div>
    </div>
  );
}
