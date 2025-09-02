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
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('[EventsPage] Error fetching events:', error);
      } else {
        setEvents(data as Event[]);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="cursor-pointer"
            onClick={() => router.push(`/events/${event.id}`)}
          >
            <EventSessionCard
              id={event.id}
              title={event.name}
              description={event.description || 'No description'}
              imageUrl={event.photo_url || '/images/placeholder.png'} // fallback placeholder
              eventId={''}
              sessionId={''}
              cost={0}
              isRegistered={false}
              paymentStatus={''} // cost & currency not needed for events
            />
            
          </div>
        ))}
      </div>
    </div>
  );
}
