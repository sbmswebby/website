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
};

type Session = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  cost: number | null;
  upi_link: string | null;
  image_url: string | null;
};

export default function EventsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*, events(name, description, date)')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('[EventsPage] Error fetching sessions:', error);
        setError('Failed to load sessions. Please try again.');
        setIsLoading(false);
      } else {
        setSessions(data as Session[]);
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading sessions...</p>
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
      <h1 className="text-3xl font-bold mb-6">Upcoming Sessions</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            // ✅ Ensure safe image URL
            const safeImageUrl =
              session.image_url && session.image_url.trim() !== ''
                ? session.image_url
                : '/images/placeholder.png';

            return (
              <div
                key={session.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/events/${session.event_id}/sessions/${session.id}`)
                }
              >
                <EventSessionCard
                  id={session.id}
                  title={session.name}
                  description={session.description || 'No description'}
                  imageUrl={safeImageUrl}
                  eventId={session.event_id}
                  sessionId={session.id}
                  cost={session.cost || 0}
                  isRegistered={false}
                  paymentStatus={''}
                />
              </div>
            );
          })
        ) : (
          <p>No upcoming sessions found.</p>
        )}
      </div>
    </div>
  );
}
