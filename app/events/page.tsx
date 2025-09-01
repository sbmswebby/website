'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
          <div
            key={event.id}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg cursor-pointer transition"
            onClick={() => router.push(`/events/${event.id}`)} // use UUID
          >
            {event.photo_url && (
              <img
                src={event.photo_url}
                alt={event.name}
                className="w-full h-48 object-cover rounded"
              />
            )}
            <h3 className="mt-2 text-xl font-semibold">{event.name}</h3>
            {event.description && (
              <p className="text-gray-600 mt-1 line-clamp-3">{event.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Date: {new Date(event.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
 