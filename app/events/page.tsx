'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
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

      if (error) console.error(error);
      else setEvents(data as Event[]);
    };
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} onClick={() => router.push(`/events/${event.id}`)}>
            <EventSessionCard
              id={event.id}
              title={event.name}
              description={event.description || 'No description'}
              imageUrl={event.photo_url || '/images/placeholder.png'}
              eventId={''}
              sessionId={''}
              cost={0} isRegistered={false} paymentStatus={''}  // cost & currency not needed for events
            />
          </div>
        ))}
      </div>
    </div>
  );
}
