'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { EventSessionCard } from '@/components/EventSessionCard';

type Event = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
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
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('[EventsPage] Error fetching events:', error);
        setError('Failed to load events. Please try again.');
        setIsLoading(false);
      } else {
        setEvents(data as Event[]);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading events...</p>
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
          events.map((event) => (
            <div
              key={event.id}
              className="cursor-pointer"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <EventSessionCard
                id={event.id}
                title={event.name}
                description={event.description || 'No description'}
                imageUrl={event.photo_url || '/images/placeholder.png'}
                eventId={''}
                sessionId={''}
                cost={0}
                isRegistered={false}
                paymentStatus={''}
              />
            </div>
          ))
        ) : (
          <p>No upcoming events found.</p>
        )}
      </div>
    </div>
  );
}